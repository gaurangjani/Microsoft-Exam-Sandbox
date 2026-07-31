'use client';

import { useState } from 'react';
import ExamSelector from './components/ExamSelector';
import ExamSession from './components/ExamSession';

export default function Home() {
  const [currentView, setCurrentView] = useState('selector');
  const [selectedExam, setSelectedExam] = useState(null);
  const [error, setError] = useState(null);

  function handleSelectExam(exam) {
    setSelectedExam(exam);
    setCurrentView('session');
    setError(null);
  }

  function handleExamComplete(result) {
    // Exam completed, user can see the score report in ExamSession component
    // Add a button to return to selector
  }

  function handleError(message) {
    setError(message);
  }

  function handleBackToSelector() {
    if (currentView === 'session' && !error) {
      if (!confirm('Are you sure? Your exam progress will be lost.')) {
        return;
      }
    }
    setCurrentView('selector');
    setSelectedExam(null);
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h1 style={styles.errorTitle}>⚠️ Error</h1>
        <p style={styles.errorMessage}>{error}</p>
        <button onClick={() => { setError(null); setCurrentView('selector'); }} style={styles.errorBtn}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main style={styles.main}>
      {currentView === 'selector' && (
        <ExamSelector onSelectExam={handleSelectExam} onError={handleError} />
      )}
      {currentView === 'session' && selectedExam && (
        <div>
          <button onClick={handleBackToSelector} style={styles.backBtn}>
            ← Back to Exams
          </button>
          <ExamSession exam={selectedExam} onComplete={handleExamComplete} onError={handleError} />
        </div>
      )}
    </main>
  );
}

const styles = {
  main: {
    backgroundColor: 'var(--bg-page)',
    minHeight: '100vh',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-surface-alt)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  errorTitle: {
    fontSize: '28px',
    color: 'var(--danger)',
    marginBottom: '10px',
  },
  errorMessage: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    marginBottom: '20px',
    maxWidth: '500px',
    textAlign: 'center',
  },
  errorBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: 'var(--accent)',
    color: 'var(--accent-contrast)',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  backBtn: {
    position: 'sticky',
    top: '10px',
    left: '10px',
    padding: '8px 16px',
    fontSize: '13px',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    borderRadius: '4px',
    cursor: 'pointer',
    zIndex: 100,
    margin: '10px',
  },
};
