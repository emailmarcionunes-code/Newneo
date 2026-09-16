'use client';

export function NewneoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="newneo-left" x1="7" y1="4" x2="18" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F8FAFC" />
          <stop offset="0.58" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id="newneo-diagonal" x1="13" y1="7" x2="36" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F8FAFC" />
          <stop offset="0.34" stopColor="#BAE6FD" />
          <stop offset="0.7" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="newneo-right" x1="32" y1="5" x2="39" y2="43" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38BDF8" />
          <stop offset="0.52" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      <rect x="6" y="5" width="10" height="38" rx="2.5" fill="url(#newneo-left)" />
      <path d="M13 7.5L35 40.5C36.3 42.4 39 41.5 39 39.2V31.6L19 5H15.1C13.7 5 12.9 6.3 13 7.5Z" fill="url(#newneo-diagonal)" />
      <rect x="32" y="5" width="10" height="38" rx="2.5" fill="url(#newneo-right)" />
    </svg>
  );
}

export function NewneoWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-label="NEWNEO"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 8 : 10,
        whiteSpace: 'nowrap',
      }}
    >
      <NewneoMark size={compact ? 28 : 32} />
      {!compact && (
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '-0.03em',
          }}
        >
          <span style={{ color: '#E2E8F0' }}>NEW</span>
          <span style={{ color: '#38BDF8' }}>NEO</span>
        </span>
      )}
    </span>
  );
}
