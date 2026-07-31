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
  const submitRef = useRef(null);

  useEffect(() => {
    loadQuestions();
  }, [exam]);

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

      if (!response.ok) throw new Error('Failed to load questions');
      const data = await response.json();
      setQuestions(data.questions);
      setLoading(false);
    } catch (error) {
      onError(error.message);
      setLoading(false);
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
        <p>Loading exam questions...</p>
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{exam.title}</h1>
          <p style={styles.code}>{exam.code}</p>
        </div>
        <div style={styles.timer}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: timeRemaining < 300 ? '#d13438' : '#000' }}>
            {formatTime(timeRemaining)}
          </span>
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
              {isMarked && ' 🚩'}
            </p>

            <div style={styles.questionGrid}>
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    ...styles.qButton,
                    ...(idx === currentIndex && styles.qButtonActive),
                    ...(answers[idx] && styles.qButtonAnswered),
                    ...(markedForReview.has(idx) && styles.qButtonMarked),
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

            <div style={styles.actions}>
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
                ) : (
                  <button
                    onClick={handleSubmit}
                    style={{ ...styles.btn, backgroundColor: '#107c10', color: '#fff' }}
                  >
                    Submit Exam
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

  return (
    <div style={styles.container}>
      <div style={styles.reportHeader}>
        <h1 style={styles.title}>{exam.title}</h1>
        <div style={{
          ...styles.scoreCard,
          backgroundColor: score.passed ? '#107c10' : '#d13438',
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
        <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Review Your Answers</h2>

        {questions.map((question, idx) => {
          const result = score.results[idx];
          const userAnswerTexts = (answers[idx] || []).map(i => question.options[i]).join(', ');
          const correctAnswerTexts = result.correctAnswers.map(i => question.options[i]).join(', ');

          return (
            <div
              key={idx}
              style={{
                ...styles.reviewItem,
                borderLeftColor: result.isCorrect ? '#107c10' : '#d13438',
              }}
            >
              <div style={styles.reviewHeader}>
                <span style={{
                  ...styles.reviewIcon,
                  color: result.isCorrect ? '#107c10' : '#d13438',
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
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
    color: '#000',
  },
  code: {
    fontSize: '12px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  timer: {
    textAlign: 'right',
  },
  progressBar: {
    height: '4px',
    backgroundColor: '#e0e0e0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0078d4',
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
    color: '#666',
    margin: '0 0 12px 0',
  },
  questionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
    gap: '8px',
    maxWidth: '400px',
  },
  qButton: {
    padding: '8px',
    fontSize: '12px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  qButtonActive: {
    backgroundColor: '#0078d4',
    color: '#fff',
    border: '1px solid #0078d4',
  },
  qButtonAnswered: {
    backgroundColor: '#e7f3f9',
    border: '1px solid #0078d4',
  },
  qButtonMarked: {
    backgroundColor: '#fff4ce',
    border: '1px solid #ffd700',
  },
  question: {
    marginBottom: '40px',
  },
  questionText: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 24px 0',
    lineHeight: '1.5',
  },
  options: {
    marginBottom: '32px',
  },
  option: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '12px',
    marginBottom: '12px',
    border: '1px solid #ddd',
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
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
    borderTop: '1px solid #ddd',
  },
  btn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid #0078d4',
    backgroundColor: '#0078d4',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnSecondary: {
    backgroundColor: '#fff',
    color: '#0078d4',
    border: '1px solid #0078d4',
  },
  btnSecondaryActive: {
    backgroundColor: '#ffd700',
    color: '#000',
    border: '1px solid #ffd700',
  },
  navButtons: {
    display: 'flex',
    gap: '12px',
  },
  // Report styles
  reportHeader: {
    padding: '40px',
    backgroundColor: '#f5f5f5',
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
    border: '1px solid #ddd',
    borderLeft: '4px solid #999',
    borderRadius: '4px',
    backgroundColor: '#fafafa',
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
    backgroundColor: '#e7f3f9',
    color: '#0078d4',
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
    backgroundColor: '#fff',
    borderRadius: '4px',
    lineHeight: '1.6',
  },
  reviewExplanation: {
    fontSize: '14px',
    margin: '12px 0',
    lineHeight: '1.6',
    fontStyle: 'italic',
    color: '#555',
  },
  reviewLink: {
    fontSize: '13px',
    color: '#0078d4',
    textDecoration: 'none',
    fontWeight: '600',
  },
};
