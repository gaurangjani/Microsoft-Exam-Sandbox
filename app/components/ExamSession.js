'use client';

import { useState, useEffect, useRef } from 'react';
import { calculateScore } from '@/lib/question-generator';

export default function ExamSession({ exam, onComplete, onError }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [totalBatches, setTotalBatches] = useState(0);
  const [batchSize, setBatchSize] = useState(5);
  const [loadedBatches, setLoadedBatches] = useState(new Set([0]));
  const [batchLoading, setBatchLoading] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const submitRef = useRef(null);
  const loadingRef = useRef(new Set([0]));

  useEffect(() => {
    loadQuestions();
  }, [exam]);

  // Load additional batches in background as user progresses.
  // A batch may return fewer questions than batchSize (salvaged from a
  // truncated LLM response), so prefetch is driven by how close the user
  // is to the end of the loaded questions, not by index arithmetic.
  useEffect(() => {
    if (questions.length === 0 || submitted) return;

    if (questions.length - currentIndex <= 4) {
      let next = 0;
      while (loadingRef.current.has(next)) next++;
      if (next < totalBatches) {
        loadBatch(next);
      }
    }
  }, [currentIndex, questions.length, submitted, totalBatches, batchSize, retryTick]);

  // Start timer only after questions load
  useEffect(() => {
    if (loading || submitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          submitRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitted]);

  async function loadQuestions() {
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examCode: exam.code }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load questions');

      setQuestions(data.questions);
      setTotalBatches(data.totalBatches || 50);
      setBatchSize(data.batchSize || 2);
      loadingRef.current.add(0);
      setLoadedBatches(new Set([0]));
      setLoading(false);
    } catch (error) {
      onError(error.message);
      setLoading(false);
    }
  }

  async function loadBatch(batchIndex) {
    if (loadingRef.current.has(batchIndex)) return;

    loadingRef.current.add(batchIndex);
    setBatchLoading(true);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examCode: exam.code, batchIndex }),
      });

      if (!response.ok) {
        console.error(`Failed to load batch ${batchIndex}, retrying in 4s`);
        loadingRef.current.delete(batchIndex);
        setTimeout(() => setRetryTick((t) => t + 1), 4000);
        return;
      }

      const data = await response.json();
      setQuestions((prev) => [...prev, ...data.questions]);
      setLoadedBatches((prev) => new Set([...prev, batchIndex]));
    } catch (error) {
      console.error(`Error loading batch ${batchIndex}, retrying in 4s:`, error);
      loadingRef.current.delete(batchIndex);
      setTimeout(() => setRetryTick((t) => t + 1), 4000);
    } finally {
      setBatchLoading(false);
    }
  }

  function handleAnswer(questionIndex, selectedOptions) {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOptions,
    }));
  }

  function toggleMarkForReview(questionIndex) {
    const newMarked = new Set(markedForReview);
    if (newMarked.has(questionIndex)) {
      newMarked.delete(questionIndex);
    } else {
      newMarked.add(questionIndex);
    }
    setMarkedForReview(newMarked);
  }

  const handleSubmit = () => {
    if (submitted || questions.length === 0) return;

    // Convert answers object to array aligned with questions
    const answerArray = questions.map((_, idx) => answers[idx] || []);
    const result = calculateScore(answerArray, questions);

    setScore(result);
    setSubmitted(true);
    onComplete({ exam, result, questions, answers: answerArray });
  };

  function handleEndEarly() {
    if (submitted || questions.length === 0) return;

    const answeredCount = Object.keys(answers).filter((k) => answers[k]?.length > 0).length;
    const upTo = currentIndex + 1;
    if (
      !confirm(
        `End the exam now?\n\nYou have answered ${answeredCount} of the ${upTo} question(s) reached so far. Only those ${upTo} question(s) will be scored — unanswered ones count as incorrect.`
      )
    ) {
      return;
    }

    try {
      const subset = questions.slice(0, upTo);
      const answerArray = questions.slice(0, upTo).map((_, idx) => answers[idx] || []);
      const result = calculateScore(answerArray, subset);

      // Only pass answers for the subset of questions
      const subsetAnswers = {};
      for (let i = 0; i < upTo; i++) {
        subsetAnswers[i] = answers[i] || [];
      }

      setQuestions(subset);
      setScore(result);
      setSubmitted(true);
      onComplete({ exam, result, questions: subset, answers: subsetAnswers });
    } catch (error) {
      console.error('Error in handleEndEarly:', error);
      alert('An error occurred while ending the exam. Please try submitting normally.');
    }
  }

  // Keep submitRef updated with latest handler
  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [submitted, questions, answers]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
            Generating exam questions...
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            This can take up to a minute depending on the AI model configured. Thanks for your patience.
          </p>
        </div>
      </div>
    );
  }

  if (submitted && score) {
    return (
      <ScoreReport
        exam={exam}
        score={score}
        questions={questions}
        answers={answers}
      />
    );
  }

  const currentQuestion = questions[currentIndex];
  const isAnswered = answers[currentIndex] && answers[currentIndex].length > 0;
  const isMarked = markedForReview.has(currentIndex);
  const moreBatchesPending = totalBatches > 0 && loadedBatches.size < totalBatches;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{exam.title}</h1>
          <p style={styles.code}>{exam.code}</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.batchStatus}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              📚 {questions.length} question{questions.length !== 1 ? 's' : ''} ready
              {moreBatchesPending && ` (target ${totalBatches * batchSize})`}
            </span>
            {batchLoading && <span style={{ marginLeft: '8px', color: 'var(--accent)' }}>⏳ Loading more...</span>}
          </div>
          <div style={styles.timer}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: timeRemaining < 300 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      <div style={styles.content}>
        <div style={styles.main}>
          <div style={styles.questionNav}>
            <p style={styles.qNum}>
              Question {currentIndex + 1} of {questions.length}
              {moreBatchesPending && (
                <span style={{ color: 'var(--accent)', fontWeight: '600' }}> (more loading…)</span>
              )}
              {isMarked && ' 🚩'}
            </p>

            <div style={styles.questionGrid}>
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    ...styles.qButton,
                    ...(answers[idx] && styles.qButtonAnswered),
                    ...(markedForReview.has(idx) && styles.qButtonMarked),
                    ...(idx === currentIndex && styles.qButtonActive),
                  }}
                  title={`Q${idx + 1}${markedForReview.has(idx) ? ' (marked)' : ''}${answers[idx] ? ' (answered)' : ''}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.question}>
            <h2 style={styles.questionText}>{currentQuestion.question}</h2>

            <div style={styles.options}>
              {currentQuestion.options.map((option, idx) => (
                <label key={idx} style={styles.option}>
                  <input
                    type={currentQuestion.type === 'multi-select' ? 'checkbox' : 'radio'}
                    name={`q${currentIndex}`}
                    checked={(answers[currentIndex] || []).includes(idx)}
                    onChange={() => {
                      if (currentQuestion.type === 'multi-select') {
                        const current = answers[currentIndex] || [];
                        const updated = current.includes(idx)
                          ? current.filter((i) => i !== idx)
                          : [...current, idx];
                        handleAnswer(currentIndex, updated);
                      } else {
                        handleAnswer(currentIndex, [idx]);
                      }
                    }}
                    style={styles.input}
                  />
                  <span style={styles.optionText}>{option}</span>
                </label>
              ))}
            </div>

            {currentIndex === questions.length - 1 && !moreBatchesPending && (
              <div style={styles.submissionSummary}>
                <p style={{ margin: '0 0 12px 0', fontWeight: '600', fontSize: '14px' }}>📋 Exam Summary:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success)' }}>
                      {Object.keys(answers).filter(k => answers[k]?.length > 0).length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Answered</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--warning-border)' }}>
                      {markedForReview.size}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Marked for Review</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--danger)' }}>
                      {questions.length - Object.keys(answers).filter(k => answers[k]?.length > 0).length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Unanswered</div>
                  </div>
                </div>
              </div>
            )}

            <div style={styles.actions}>
              <div style={styles.leftActions}>
                <button
                  onClick={() => toggleMarkForReview(currentIndex)}
                  style={{
                    ...styles.btn,
                    ...styles.btnSecondary,
                    ...(isMarked && styles.btnSecondaryActive),
                  }}
                >
                  {isMarked ? '🚩 Marked' : '☐ Mark for Review'}
                </button>

                <button
                  onClick={handleEndEarly}
                  style={{ ...styles.btn, ...styles.btnDanger }}
                  title="End the exam now and score only the questions attempted so far"
                >
                  ⏹ End Exam
                </button>
              </div>

              <div style={styles.navButtons}>
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  style={currentIndex === 0 ? { ...styles.btn, opacity: 0.5, cursor: 'not-allowed' } : styles.btn}
                >
                  ← Previous
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    style={styles.btn}
                  >
                    Next →
                  </button>
                ) : moreBatchesPending ? (
                  <button
                    disabled
                    style={{ ...styles.btn, opacity: 0.6, cursor: 'wait' }}
                    title="The next question is still being generated"
                  >
                    ⏳ Loading next question...
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    style={{
                      ...styles.btn,
                      backgroundColor: 'var(--success)',
                      border: '1px solid var(--success)',
                      color: '#fff',
                      fontSize: '16px',
                      padding: '12px 24px',
                      fontWeight: 'bold'
                    }}
                    title="Review your answers before final submission"
                  >
                    ✓ Review & Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreReport({ exam, score, questions, answers }) {
  const scorePercentage = Math.round(score.scorePercentage);

  // Calculate scores by skill area/category
  const categoryScores = {};
  questions.forEach((question, idx) => {
    const category = question.skillArea || 'Uncategorized';
    if (!categoryScores[category]) {
      categoryScores[category] = { total: 0, correct: 0 };
    }
    categoryScores[category].total += 1;
    if (score.results[idx]?.isCorrect) {
      categoryScores[category].correct += 1;
    }
  });

  const sortedCategories = Object.entries(categoryScores).sort((a, b) => b[1].correct - a[1].correct);

  return (
    <div style={styles.container}>
      <div style={styles.reportHeader}>
        <h1 style={styles.title}>{exam.title}</h1>
        <div style={{
          ...styles.scoreCard,
          backgroundColor: score.passed ? 'var(--success)' : 'var(--danger)',
        }}>
          <div style={styles.scoreValue}>{scorePercentage}%</div>
          <div style={styles.scoreStatus}>
            {score.passed ? '✓ PASSED' : '✗ NOT PASSED'}
          </div>
          <div style={styles.scoreDetails}>
            {score.correctCount} of {score.totalCount} correct
          </div>
        </div>
      </div>

      <div style={styles.reportContent}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Performance by Category</h2>
        <div style={styles.categoryGrid}>
          {sortedCategories.map(([category, stats]) => {
            const categoryPercentage = Math.round((stats.correct / stats.total) * 100);
            return (
              <div key={category} style={styles.categoryCard}>
                <div style={styles.categoryName}>{category}</div>
                <div style={styles.categoryScore}>{categoryPercentage}%</div>
                <div style={styles.categoryDetails}>
                  {stats.correct} of {stats.total} correct
                </div>
              </div>
            );
          })}
        </div>

        <h2 style={{ marginTop: '40px', marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Review Your Answers</h2>

        {questions.map((question, idx) => {
          const result = score.results?.[idx];
          if (!result) return null;
          const userAnswerIndices = Array.isArray(answers) ? answers[idx] : answers[idx];
          const userAnswerTexts = (userAnswerIndices || []).map(i => question.options[i]).join(', ');
          const correctAnswerTexts = (result.correctAnswers || []).map(i => question.options[i]).join(', ');

          return (
            <div
              key={idx}
              style={{
                ...styles.reviewItem,
                borderLeftColor: result.isCorrect ? 'var(--success)' : 'var(--danger)',
              }}
            >
              <div style={styles.reviewHeader}>
                <span style={{
                  ...styles.reviewIcon,
                  color: result.isCorrect ? 'var(--success)' : 'var(--danger)',
                }}>
                  {result.isCorrect ? '✓' : '✗'}
                </span>
                <span style={styles.reviewQNum}>Question {idx + 1}</span>
                <span style={styles.reviewType}>{question.type}</span>
              </div>

              <p style={styles.reviewQuestion}>{question.question}</p>

              <div style={styles.reviewAnswers}>
                <p><strong>Your answer:</strong> {userAnswerTexts || 'Not answered'}</p>
                <p><strong>Correct answer:</strong> {correctAnswerTexts}</p>
              </div>

              <p style={styles.reviewExplanation}>{question.explanation}</p>

              {question.sourceUrl && (
                <a
                  href={question.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.reviewLink}
                >
                  Learn more →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: 'var(--bg-page)',
    color: 'var(--text-primary)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-surface-alt)',
    flexWrap: 'wrap',
    gap: '20px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  batchStatus: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
    color: 'var(--text-primary)',
  },
  code: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: '4px 0 0 0',
  },
  timer: {
    textAlign: 'right',
  },
  progressBar: {
    height: '4px',
    backgroundColor: 'var(--border-color)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    transition: 'width 0.3s',
  },
  content: {
    display: 'flex',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  main: {
    flex: 1,
    padding: '40px',
  },
  questionNav: {
    marginBottom: '40px',
  },
  qNum: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: '0 0 12px 0',
  },
  questionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(36px, 1fr))',
    gap: '6px',
    maxWidth: '100%',
  },
  qButton: {
    padding: '6px 4px',
    fontSize: '11px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  qButtonAnswered: {
    backgroundColor: 'var(--accent-soft-bg)',
    border: '1px solid var(--accent)',
    color: 'var(--text-primary)',
  },
  qButtonMarked: {
    backgroundColor: 'var(--warning-bg)',
    border: '1px solid var(--warning-border)',
    color: 'var(--text-primary)',
  },
  // Applied last so the current question always stands out clearly,
  // even when it is also answered and/or marked
  qButtonActive: {
    backgroundColor: 'var(--accent)',
    color: 'var(--accent-contrast)',
    border: '1px solid var(--accent)',
    fontWeight: 'bold',
    outline: '2px solid var(--text-primary)',
    outlineOffset: '1px',
    transform: 'scale(1.12)',
  },
  question: {
    marginBottom: '40px',
  },
  questionText: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 24px 0',
    lineHeight: '1.5',
    color: 'var(--text-primary)',
  },
  options: {
    marginBottom: '32px',
  },
  option: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '12px',
    marginBottom: '12px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  input: {
    marginRight: '12px',
    marginTop: '4px',
    cursor: 'pointer',
  },
  optionText: {
    flex: 1,
    fontSize: '14px',
    color: 'var(--text-primary)',
  },
  submissionSummary: {
    padding: '16px',
    marginBottom: '24px',
    backgroundColor: 'var(--accent-soft-bg)',
    border: '1px solid var(--accent)',
    borderRadius: '4px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
    borderTop: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  leftActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  btn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid var(--accent)',
    backgroundColor: 'var(--accent)',
    color: 'var(--accent-contrast)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnSecondary: {
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
  },
  btnSecondaryActive: {
    backgroundColor: 'var(--warning-border)',
    color: '#000',
    border: '1px solid var(--warning-border)',
  },
  btnDanger: {
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--danger)',
    border: '1px solid var(--danger)',
  },
  navButtons: {
    display: 'flex',
    gap: '12px',
  },
  // Report styles
  reportHeader: {
    padding: '40px',
    backgroundColor: 'var(--bg-surface-alt)',
    textAlign: 'center',
  },
  scoreCard: {
    display: 'inline-block',
    padding: '40px',
    borderRadius: '8px',
    color: '#fff',
    marginTop: '20px',
    minWidth: '300px',
  },
  scoreValue: {
    fontSize: '64px',
    fontWeight: 'bold',
  },
  scoreStatus: {
    fontSize: '24px',
    fontWeight: '600',
    marginTop: '12px',
  },
  scoreDetails: {
    fontSize: '14px',
    marginTop: '12px',
    opacity: 0.9,
  },
  reportContent: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px',
  },
  reviewItem: {
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid var(--border-color)',
    borderLeft: '4px solid var(--text-muted)',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-surface-alt)',
  },
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  reviewIcon: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  reviewQNum: {
    fontSize: '14px',
    fontWeight: '600',
    flex: 1,
  },
  reviewType: {
    fontSize: '12px',
    backgroundColor: 'var(--accent-soft-bg)',
    color: 'var(--accent)',
    padding: '4px 8px',
    borderRadius: '3px',
  },
  reviewQuestion: {
    fontSize: '15px',
    fontWeight: '500',
    margin: '0 0 16px 0',
    lineHeight: '1.5',
  },
  reviewAnswers: {
    fontSize: '14px',
    margin: '12px 0',
    padding: '12px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '4px',
    lineHeight: '1.6',
  },
  reviewExplanation: {
    fontSize: '14px',
    margin: '12px 0',
    lineHeight: '1.6',
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
  },
  reviewLink: {
    fontSize: '13px',
    color: 'var(--accent)',
    textDecoration: 'none',
    fontWeight: '600',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '40px',
  },
  categoryCard: {
    padding: '20px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-surface)',
    textAlign: 'center',
  },
  categoryName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '12px',
    lineHeight: '1.4',
  },
  categoryScore: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'var(--accent)',
    marginBottom: '8px',
  },
  categoryDetails: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
};
