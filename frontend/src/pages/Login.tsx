import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AxiosError } from 'axios';
import api from '../api';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFields = z.infer<typeof schema>;

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFields>({
    resolver: zodResolver(schema),
  });

  async function onSubmit({ email, password }: LoginFields) {
    setServerError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post<{ token: string }>(endpoint, { email, password });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setServerError(e.response?.data?.error ?? 'Something went wrong');
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
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div>
            <input style={styles.input} type="email" placeholder="Email" {...register('email')} />
            {errors.email && <p style={styles.fieldError}>{errors.email.message}</p>}
          </div>
          <div>
            <input style={styles.input} type="password" placeholder="Password" {...register('password')} />
            {errors.password && <p style={styles.fieldError}>{errors.password.message}</p>}
          </div>
          {serverError && <p style={styles.error}>{serverError}</p>}
          <button style={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '360px' },
  title: { textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 },
  tabs: { display: 'flex', marginBottom: '1.5rem', borderBottom: '2px solid #eee' },
  tab: { flex: 1, padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1rem' },
  activeTab: { flex: 1, padding: '0.5rem', background: 'none', border: 'none', borderBottom: '2px solid #4f46e5', cursor: 'pointer', color: '#4f46e5', fontWeight: 600, fontSize: '1rem', marginBottom: '-2px' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: { padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', width: '100%', boxSizing: 'border-box' },
  button: { padding: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: 0 },
  fieldError: { color: '#dc2626', fontSize: '0.8rem', margin: '0.25rem 0 0 0' },
};
