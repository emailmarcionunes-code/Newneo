// Fail closed until real identity, evaluation, approval and deployment adapters
// exist. Client preferences, reference scores and preview receipts grant nothing.
export async function POST() {
  return Response.json(
    {
      error:
        'Live deployment is unavailable. A real evaluation and authorized production approval are required.',
    },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
