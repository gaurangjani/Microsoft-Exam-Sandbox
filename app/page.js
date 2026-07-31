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
    backgroundColor: '#fff',
    minHeight: '100vh',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  errorTitle: {
    fontSize: '28px',
    color: '#d13438',
    marginBottom: '10px',
  },
  errorMessage: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '20px',
    maxWidth: '500px',
    textAlign: 'center',
  },
  errorBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#0078d4',
    color: '#fff',
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
    backgroundColor: '#fff',
    color: '#0078d4',
    border: '1px solid #0078d4',
    borderRadius: '4px',
    cursor: 'pointer',
    zIndex: 100,
    margin: '10px',
  },
};
