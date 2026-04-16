export async function GET() {
  return Response.json({ status: 'ok', service: 'SentinAI', time: new Date().toISOString() });
}
