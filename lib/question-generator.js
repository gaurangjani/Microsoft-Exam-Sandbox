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
    const content = data.choices[0].message.content;

    try {
      const questions = JSON.parse(content);
      return questions;
    } catch (e) {
      console.error('Failed to parse questions JSON:', content);
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

export function calculateScore(answers, questions) {
  let correctCount = 0;
  const results = answers.map((answer, idx) => {
    const question = questions[idx];
    const isCorrect =
      JSON.stringify(answer.sort()) ===
      JSON.stringify(question.correctAnswers.sort());

    if (isCorrect) correctCount++;

    return {
      questionIndex: idx,
      isCorrect,
      userAnswer: answer,
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
