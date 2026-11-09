import { generateExamQuestions } from '@/lib/question-generator';
import { fetchExamOutline } from '@/lib/microsoft-learn';

export const maxDuration = 40;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!process.env.HEALTH_CHECK_SECRET || key !== process.env.HEALTH_CHECK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  try {
    const examOutline = await fetchExamOutline('AZ-900');
    if (!examOutline) {
      return Response.json({ ok: false, model, error: 'Exam outline not available for AZ-900' }, { status: 503 });
    }

    const questions = await generateExamQuestions(examOutline, 1, 0);
    return Response.json({ ok: true, model, questionCount: questions.length });
  } catch (error) {
    return Response.json({ ok: false, model, error: error.message || 'Unknown error' }, { status: 500 });
  }
}
