const REASONING_ID_PATTERN = /(^|[-/])(o1|o3|r1|thinking|reasoning)([-/]|$)/i;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const exclude = searchParams.get('exclude');

  const response = await fetch('https://openrouter.ai/api/v1/models');
  if (!response.ok) {
    return Response.json(
      { error: `OpenRouter models request failed: HTTP ${response.status}` },
      { status: 502 }
    );
  }

  const data = await response.json();
  const models = Array.isArray(data?.data) ? data.data : [];

  const candidates = models
    .filter((m) => m?.pricing?.prompt === '0' && m?.pricing?.completion === '0')
    .filter((m) => m.id !== exclude)
    .filter((m) => !REASONING_ID_PATTERN.test(m.id))
    .filter((m) => m?.architecture?.modality === 'text->text')
    .sort((a, b) => (b.context_length || 0) - (a.context_length || 0))
    .slice(0, 10)
    .map((m) => ({ id: m.id, context_length: m.context_length || null }));

  return Response.json({ candidates });
}
