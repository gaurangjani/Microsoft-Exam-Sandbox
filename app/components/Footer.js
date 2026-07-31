'use client';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        padding: '20px 40px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-surface-alt)',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-secondary)',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <p style={{ margin: '0 0 8px 0' }}>
          Microsoft Certification Exam Simulator
        </p>
        <p style={{ margin: '0' }}>
          Hosted on{' '}
          <a
            href="https://d365finance.uk"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--accent)',
              fontWeight: '600',
              textDecoration: 'none',
            }}
            onMouseOver={(e) => (e.target.style.textDecoration = 'underline')}
            onMouseOut={(e) => (e.target.style.textDecoration = 'none')}
          >
            d365finance.uk
          </a>
        </p>
      </div>
    </footer>
  );
}
