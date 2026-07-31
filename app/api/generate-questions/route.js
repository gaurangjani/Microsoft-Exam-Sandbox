import { generateExamQuestions } from '@/lib/question-generator';
import { fetchExamOutline, fetchExamCatalog } from '@/lib/microsoft-learn';
import { getRateLimitStatus, getClientIp } from '@/lib/rate-limit';

export const maxDuration = 30;

export async function POST(request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = getRateLimitStatus(clientIp);

    if (rateLimit.isLimited) {
      return Response.json(
        {
          error: 'Rate limit exceeded. Maximum 5 questions per minute.',
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    const { examCode } = await request.json();

    if (!examCode || typeof examCode !== 'string') {
      return Response.json({ error: 'examCode is required and must be a string' }, { status: 400 });
    }

    // Validate exam code against catalog
    const catalog = await fetchExamCatalog();
    const examExists = catalog.some((e) => e.code === examCode);
    if (!examExists) {
      return Response.json(
        { error: `Exam code "${examCode}" not found in catalog` },
        { status: 400 }
      );
    }

    // Fetch the exam outline
    const examOutline = await fetchExamOutline(examCode);
    if (!examOutline) {
      return Response.json(
        { error: `Exam outline not available for ${examCode}` },
        { status: 503 }
      );
    }

    // Generate questions using LLM
    const questions = await generateExamQuestions(examOutline, 10);

    return Response.json({
      examCode,
      title: examOutline.title,
      questions,
      duration: examOutline.duration,
      passingScore: examOutline.passingScore,
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return Response.json(
      {
        error: error.message || 'Failed to generate questions',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
