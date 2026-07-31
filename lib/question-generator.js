export async function generateExamQuestions(examOutline, numQuestions = 10) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  if (!model) {
    throw new Error('OPENROUTER_MODEL is not configured');
  }

  const prompt = buildPrompt(examOutline, numQuestions);

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
        temperature: 0.7,
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

function buildPrompt(examOutline, numQuestions) {
  const skillsList = examOutline.skills.map((s) => `- ${s.area} (${s.weight}%)`).join('\n');

  return `You are an expert in creating Microsoft certification exam questions. Based on the exam skills below, generate ${numQuestions} original practice questions that mirror real Microsoft exam formats.

EXAM: ${examOutline.title} (${examOutline.code})

SKILLS MEASURED:
${skillsList}

REQUIREMENTS:
1. Generate exactly ${numQuestions} questions
2. Vary question types: single-select MCQ, multi-select, true/false statements, scenario-based
3. Ground each question strictly in the skills measured—no fabricated content
4. Each question must have:
   - "type": "single-select" | "multi-select" | "true-false" | "scenario"
   - "question": clear, specific question text
   - "options": array of answer choices (3-4 for MCQ, 2 for true/false)
   - "correctAnswers": array of indices of correct option(s)
   - "explanation": why the correct answer is right, 1-2 sentences
   - "skillArea": which skills area this tests
   - "sourceUrl": link to relevant Microsoft Learn doc (use realistic structure)

Return ONLY valid JSON array. No markdown, no extra text. Example:
[
  {
    "type": "single-select",
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswers": [1],
    "explanation": "...",
    "skillArea": "...",
    "sourceUrl": "https://learn.microsoft.com/en-us/training/..."
  }
]`;
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
