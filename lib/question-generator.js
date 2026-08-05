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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    let response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
          temperature: 0.7 + (batchIndex % 10) * 0.02,
          max_tokens: 1800,
        }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error(
          `Model "${model}" did not respond within 35 seconds. Free-tier (":free") models on OpenRouter are often overloaded and slow. Switch OPENROUTER_MODEL in Vercel to a paid model like "openai/gpt-3.5-turbo" or "openai/gpt-4o-mini" for faster, more reliable responses.`
        );
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const error = await response.json();
      const msg = error.error?.message || response.statusText;
      throw new Error(`OpenRouter API error (${response.status}): ${msg}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenRouter response:', data);
      throw new Error('Invalid response format from OpenRouter API');
    }

    let content = data.choices[0].message.content;
    const wasTruncated = data.choices[0].finish_reason === 'length';

    // Strip markdown code fences if present
    content = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '');

    let questions;
    try {
      questions = JSON.parse(content);
    } catch (e) {
      // Output was likely truncated mid-JSON (finish_reason=length) or
      // malformed. Salvage the complete question objects from the partial array.
      questions = salvageTruncatedJson(content);
      if (!questions) {
        console.error('Failed to parse questions JSON (truncated:', wasTruncated, '):', content, e);
        throw new Error('Failed to parse generated questions');
      }
      console.warn(`Salvaged ${questions.length} question(s) from truncated LLM output`);
    }

    validateQuestions(questions);
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

function salvageTruncatedJson(content) {
  // Truncated output looks like `[ {...}, {...}, { "type": "single-sel`.
  // Walk back from the end, cutting at each closing brace and closing the
  // array, until we find a prefix that parses to a non-empty array.
  const start = content.indexOf('[');
  if (start === -1) return null;

  let cutAt = content.length;
  for (let attempts = 0; attempts < 60; attempts++) {
    const braceIdx = content.lastIndexOf('}', cutAt - 1);
    if (braceIdx <= start) return null;

    const candidate = content.slice(start, braceIdx + 1) + ']';
    try {
      const parsed = JSON.parse(candidate);
      if (!Array.isArray(parsed)) return null;
      // Drop any trailing question that parsed but is structurally incomplete
      const validTypes = ['single-select', 'multi-select', 'true-false', 'scenario'];
      const complete = parsed.filter(
        (q) =>
          q &&
          validTypes.includes(q.type) &&
          typeof q.question === 'string' &&
          q.question.trim().length > 0 &&
          Array.isArray(q.options) &&
          q.options.length >= 2 &&
          Array.isArray(q.correctAnswers) &&
          q.correctAnswers.length > 0 &&
          q.correctAnswers.every((i) => i >= 0 && i < q.options.length)
      );
      return complete.length > 0 ? complete : null;
    } catch {
      cutAt = braceIdx;
    }
  }
  return null;
}

function buildPrompt(examOutline, numQuestions, batchIndex = 0) {
  const skillsList = examOutline.skills.map((s) => `- ${s.area}`).join('\n');

  return `Generate ${numQuestions} UNIQUE Microsoft exam practice questions for ${examOutline.code} (batch ${batchIndex}).

SKILLS:
${skillsList}

IMPORTANT - GENERATE UNIQUE QUESTIONS:
- Each batch must have DIFFERENT questions and scenarios
- Do NOT repeat questions from previous batches
- Vary question types (single-select, multi-select, true-false, scenario)
- Cover different aspects of each skill area
- Use different real-world scenarios and contexts
- Randomize difficulty levels within the skill areas

Return ONLY JSON array. Each question:
{
  "type": "single-select",
  "question": "Question text (specific, unique scenario)",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "correctAnswers": [0],
  "explanation": "Detailed explanation",
  "skillArea": "Skill area",
  "sourceUrl": "https://learn.microsoft.com/..."
}

NO MARKDOWN. VALID JSON ONLY. ENSURE EACH QUESTION IS UNIQUE AND DISTINCT.`;
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
