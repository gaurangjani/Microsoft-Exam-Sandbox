import { generateExamQuestions } from '@/lib/question-generator';
import { fetchExamOutline, fetchExamCatalog } from '@/lib/microsoft-learn';
import { getRateLimitStatus, getClientIp } from '@/lib/rate-limit';

export const maxDuration = 40;

const BATCH_SIZE = 2;
const TOTAL_QUESTIONS = 100;
const TOTAL_BATCHES = Math.ceil(TOTAL_QUESTIONS / BATCH_SIZE);

export async function POST(request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = getRateLimitStatus(clientIp);

    if (rateLimit.isLimited) {
      return Response.json(
        {
          error: 'Rate limit exceeded. Maximum 25 requests per minute.',
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    const { examCode, batchIndex } = await request.json();

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

    // If batchIndex specified, generate that specific batch
    if (batchIndex !== undefined && batchIndex !== null) {
      const batchNum = parseInt(batchIndex);
      if (isNaN(batchNum) || batchNum < 0 || batchNum >= TOTAL_BATCHES) {
        return Response.json(
          { error: `Invalid batchIndex. Must be 0-${TOTAL_BATCHES - 1}` },
          { status: 400 }
        );
      }

      const questions = await generateExamQuestions(examOutline, BATCH_SIZE, batchNum);
      return Response.json({
        examCode,
        title: examOutline.title,
        questions,
        batchIndex: batchNum,
        totalBatches: TOTAL_BATCHES,
        batchSize: BATCH_SIZE,
      });
    }

    // Initial request: generate first batch
    const initialBatch = await generateExamQuestions(examOutline, BATCH_SIZE, 0);
    return Response.json({
      examCode,
      title: examOutline.title,
      questions: initialBatch,
      duration: examOutline.duration,
      passingScore: examOutline.passingScore,
      batchIndex: 0,
      totalBatches: TOTAL_BATCHES,
      batchSize: BATCH_SIZE,
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
