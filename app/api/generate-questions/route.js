import { generateExamQuestions } from '@/lib/question-generator';
import { fetchExamOutline } from '@/lib/microsoft-learn';

export const maxDuration = 30;

export async function POST(request) {
  try {
    const { examCode } = await request.json();

    if (!examCode) {
      return Response.json({ error: 'examCode is required' }, { status: 400 });
    }

    // Fetch the exam outline (real fetch from Microsoft Learn)
    const examOutline = await fetchExamOutline(examCode);
    if (!examOutline) {
      return Response.json(
        { error: `Exam outline not found for ${examCode}` },
        { status: 404 }
      );
    }

    // Generate questions using LLM
    const questions = await generateExamQuestions(examOutline, 10);

    return Response.json({
      examCode,
      title: examOutline.title,
      questions,
      duration: examOutline.duration || 120,
      passingScore: examOutline.passingScore || 700,
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
