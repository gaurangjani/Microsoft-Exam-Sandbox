export async function generateExamQuestions(examOutline, numQuestions = 10, batchIndex = 0) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  if (!model) {
    throw new Error('OPENROUTER_MODEL is not configured');
  }

  const prompt = buildPrompt(examOutline, numQuestions, batchIndex);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7 + batchIndex * 0.05,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Strip markdown code fences if present
    content = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '');

    try {
      const questions = JSON.parse(content);
      validateQuestions(questions);
      return questions;
    } catch (e) {
      console.error('Failed to parse questions JSON:', content, e);
      throw new Error('Failed to parse generated questions');
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

function buildPrompt(examOutline, numQuestions, batchIndex = 0) {
  const skillsList = examOutline.skills.map((s) => `- ${s.area}`).join('\n');
  const questionStart = batchIndex * numQuestions + 1;
  const questionEnd = questionStart + numQuestions - 1;

  return `Generate ${numQuestions} UNIQUE Microsoft exam practice questions for ${examOutline.code}.
This is batch ${batchIndex + 1} of 10 (questions ${questionStart}-${questionEnd}).
Focus on different aspects and scenarios than previous batches.

SKILLS:
${skillsList}

Generate ORIGINAL questions that are:
- Different difficulty levels
- Real-world scenarios
- Not similar to questions in other batches
- Vary question types (mostly single-select, some multi-select)

Return ONLY a JSON array with this structure for each question:
{
  "type": "single-select",
  "question": "Question text",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "correctAnswers": [0],
  "explanation": "Why this answer is correct",
  "skillArea": "Skill name from above",
  "sourceUrl": "https://learn.microsoft.com/en-us/training/paths/..."
}

NO MARKDOWN. JSON ONLY.`;
}

function validateQuestions(questions) {
  const validTypes = ['single-select', 'multi-select', 'true-false', 'scenario'];

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Questions must be a non-empty array');
  }

  questions.forEach((q, idx) => {
    if (!validTypes.includes(q.type)) {
      throw new Error(`Question ${idx}: invalid type "${q.type}"`);
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(`Question ${idx}: must have at least 2 options`);
    }
    if (!Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0) {
      throw new Error(`Question ${idx}: must have at least 1 correct answer`);
    }
    q.correctAnswers.forEach((ansIdx) => {
      if (ansIdx < 0 || ansIdx >= q.options.length) {
        throw new Error(`Question ${idx}: correct answer index ${ansIdx} out of range`);
      }
    });
    if (typeof q.question !== 'string' || q.question.trim().length === 0) {
      throw new Error(`Question ${idx}: must have non-empty question text`);
    }
    if (q.sourceUrl && !q.sourceUrl.startsWith('https://learn.microsoft.com/')) {
      console.warn(`Question ${idx}: sourceUrl doesn't start with microsoft.com domain, removing`);
      q.sourceUrl = '';
    }
  });
}

export function calculateScore(answers, questions) {
  if (!questions || questions.length === 0) {
    return {
      scorePercentage: 0,
      correctCount: 0,
      totalCount: 0,
      passed: false,
      results: [],
    };
  }

  let correctCount = 0;
  const results = answers.map((answer, idx) => {
    const question = questions[idx];
    const userAnswersSorted = [...(answer || [])].sort((a, b) => a - b);
    const correctAnswersSorted = [...question.correctAnswers].sort((a, b) => a - b);

    const isCorrect =
      userAnswersSorted.length === correctAnswersSorted.length &&
      userAnswersSorted.every((val, i) => val === correctAnswersSorted[i]);

    if (isCorrect) correctCount++;

    return {
      questionIndex: idx,
      isCorrect,
      userAnswer: answer || [],
      correctAnswers: question.correctAnswers,
    };
  });

  const scorePercentage = (correctCount / questions.length) * 100;
  const passingScore = 70; // Microsoft standard

  return {
    scorePercentage,
    correctCount,
    totalCount: questions.length,
    passed: scorePercentage >= passingScore,
    results,
  };
}
