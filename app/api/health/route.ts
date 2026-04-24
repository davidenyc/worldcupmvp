export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    status: "ok",
    provider: process.env.DATA_PROVIDER ?? "mock",
    ts: new Date().toISOString()
  });
}
