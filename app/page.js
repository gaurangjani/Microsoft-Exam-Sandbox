export default function Home() {
  return (
    <main style={styles.main}>
      <h1 style={styles.title}>Microsoft Certification Exam Simulator</h1>
      <p style={styles.subtitle}>Practice with live exam content from Microsoft Learn</p>
      <p style={styles.loading}>Loading exam catalog...</p>
    </main>
  );
}

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '20px',
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
    fontSize: '14px',
    color: '#999',
  },
};
