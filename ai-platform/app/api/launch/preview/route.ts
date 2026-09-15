import { handlePreview } from '@/lib/preview-server';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 32000)
      return Response.json(
        { error: 'Preview request is too large.' },
        { status: 413 },
      );
    const result = handlePreview(JSON.parse(raw));
    return Response.json(result.data, {
      status: result.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json(
      { error: 'Invalid preview request. Please try again.' },
      { status: 400 },
    );
  }
}
