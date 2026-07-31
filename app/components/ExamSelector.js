'use client';

import { useState, useEffect } from 'react';

export default function ExamSelector({ onSelectExam, onError }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    try {
      const response = await fetch('/api/exams');
      if (!response.ok) throw new Error('Failed to load exams');
      const data = await response.json();
      setExams(data);
      setLoading(false);
    } catch (error) {
      onError(error.message);
      setLoading(false);
    }
  }

  const categories = ['All', ...new Set(exams.map((e) => e.category))];

  const filtered = exams.filter((exam) => {
    const matchesSearch =
      exam.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exam.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading exam catalog...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Microsoft Certification Exams</h1>
      <p style={styles.subtitle}>Select an exam to start practicing</p>

      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by code or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        <div style={styles.categories}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...styles.categoryBtn,
                ...(selectedCategory === cat && styles.categoryBtnActive),
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.examGrid}>
        {filtered.length === 0 ? (
          <p style={styles.noResults}>No exams found. Try a different search.</p>
        ) : (
          filtered.map((exam) => (
            <div key={exam.code} style={styles.examCard}>
              <div style={styles.examHeader}>
                <h3 style={styles.examCode}>{exam.code}</h3>
                <span style={styles.examCategory}>{exam.category}</span>
              </div>
              <h2 style={styles.examTitle}>{exam.title}</h2>
              <div style={styles.examMeta}>
                <span>⏱️ {exam.duration} min</span>
                <span>✓ Pass: {exam.passingScore}</span>
              </div>
              <button
                onClick={() => onSelectExam(exam)}
                style={styles.selectBtn}
              >
                Start Practice Exam →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#0078d4',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '30px',
  },
  loading: {
    fontSize: '16px',
    color: '#999',
    textAlign: 'center',
    paddingTop: '60px',
  },
  filterBar: {
    marginBottom: '40px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '20px',
    boxSizing: 'border-box',
  },
  categories: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  categoryBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    color: '#555',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  categoryBtnActive: {
    backgroundColor: '#0078d4',
    color: '#fff',
    border: '1px solid #0078d4',
  },
  examGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  examCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '24px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    transition: 'all 0.2s',
    ':hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },
  examHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  examCode: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0078d4',
    margin: 0,
  },
  examCategory: {
    fontSize: '12px',
    backgroundColor: '#e7f3f9',
    color: '#0078d4',
    padding: '4px 8px',
    borderRadius: '3px',
  },
  examTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#000',
    margin: '0 0 16px 0',
    lineHeight: '1.4',
  },
  examMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  selectBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  noResults: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: '#999',
    padding: '40px',
  },
};
