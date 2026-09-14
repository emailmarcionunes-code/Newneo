import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/i.test(secret))
    throw new Error('SESSION_SECRET must be 32 random bytes encoded as hex.');
  return Buffer.from(secret, 'hex');
}
export function seal(
  value: Record<string, unknown>,
  purpose: string,
  expiresAt: number,
) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  cipher.setAAD(Buffer.from(purpose));
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify({ value, expiresAt }), 'utf8'),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
    'base64url',
  );
}
export function unseal(
  token: string | undefined,
  purpose: string,
): Record<string, unknown> | null {
  if (!token || token.length > 4096) return null;
  try {
    const bytes = Buffer.from(token, 'base64url');
    if (bytes.length < 29) return null;
    const decipher = createDecipheriv(
      'aes-256-gcm',
      key(),
      bytes.subarray(0, 12),
    );
    decipher.setAAD(Buffer.from(purpose));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const envelope = JSON.parse(
      Buffer.concat([
        decipher.update(bytes.subarray(28)),
        decipher.final(),
      ]).toString('utf8'),
    );
    if (
      !Number.isFinite(envelope.expiresAt) ||
      envelope.expiresAt <= Date.now() ||
      !envelope.value ||
      typeof envelope.value !== 'object' ||
      Array.isArray(envelope.value)
    )
      return null;
    return envelope.value;
  } catch {
    return null;
  }
}
