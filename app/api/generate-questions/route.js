import { generateExamQuestions } from '@/lib/question-generator';
import { fetchExamOutline, fetchExamCatalog } from '@/lib/microsoft-learn';
import { getRateLimitStatus, getClientIp } from '@/lib/rate-limit';

export const maxDuration = 40;

const BATCH_SIZE = 1;
const TOTAL_QUESTIONS = 100;
const TOTAL_BATCHES = Math.ceil(TOTAL_QUESTIONS / BATCH_SIZE);

export async function POST(request) {
  try {
    console.log('📨 [API] Request received');

    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = getRateLimitStatus(clientIp);
    console.log(`📨 [API] Rate limit check: ${rateLimit.count}/${rateLimit.limit} (IP: ${clientIp})`);

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
    console.log(`📨 [API] Exam: ${examCode}, Batch: ${batchIndex}`);

    if (!examCode || typeof examCode !== 'string') {
      return Response.json({ error: 'examCode is required and must be a string' }, { status: 400 });
    }

    // Validate exam code against catalog
    console.log(`📨 [API] Fetching catalog...`);
    const catalog = await fetchExamCatalog();
    console.log(`📨 [API] Catalog loaded: ${catalog.length} exams`);

    const examExists = catalog.some((e) => e.code === examCode);
    if (!examExists) {
      return Response.json(
        { error: `Exam code "${examCode}" not found in catalog` },
        { status: 400 }
      );
    }

    // Fetch the exam outline
    console.log(`📨 [API] Fetching outline for ${examCode}...`);
    const examOutline = await fetchExamOutline(examCode);
    console.log(`📨 [API] Outline loaded: ${examOutline?.skills?.length} skills`);

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

      console.log(`🚀 [LLM] Generating batch ${batchNum} for ${examCode}...`);
      const questions = await generateExamQuestions(examOutline, BATCH_SIZE, batchNum);
      console.log(`✅ [LLM] Generated ${questions.length} questions for batch ${batchNum}`);
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
    console.log(`🚀 [LLM] Generating initial batch for ${examCode}...`);
    const initialBatch = await generateExamQuestions(examOutline, BATCH_SIZE, 0);
    console.log(`✅ [LLM] Generated ${initialBatch.length} questions for initial batch`);
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
    console.error('❌ [API] Error:', error.message);
    console.error('❌ [API] Stack:', error.stack);
    return Response.json(
      {
        error: error.message || 'Failed to generate questions',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
