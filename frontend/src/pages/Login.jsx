import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, { email, password });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Form Builder</h1>
        <div style={styles.tabs}>
          <button style={mode === 'login' ? styles.activeTab : styles.tab} onClick={() => setMode('login')}>Login</button>
          <button style={mode === 'register' ? styles.activeTab : styles.tab} onClick={() => setMode('register')}>Register</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '360px' },
  title: { textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 },
  tabs: { display: 'flex', marginBottom: '1.5rem', borderBottom: '2px solid #eee' },
  tab: { flex: 1, padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1rem' },
  activeTab: { flex: 1, padding: '0.5rem', background: 'none', border: 'none', borderBottom: '2px solid #4f46e5', cursor: 'pointer', color: '#4f46e5', fontWeight: 600, fontSize: '1rem', marginBottom: '-2px' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: { padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  button: { padding: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: 0 },
};
