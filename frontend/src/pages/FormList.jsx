import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function FormList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/forms').then(({ data }) => {
      setForms(data);
      setLoading(false);
    });
  }, []);

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  function copyUrl(identifier) {
    navigator.clipboard.writeText(`${window.location.origin}/form/${identifier}`);
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.heading}>My Forms</h1>
        <div style={styles.headerActions}>
          <button style={styles.primaryBtn} onClick={() => navigate('/builder/new')}>+ New Form</button>
          <button style={styles.ghostBtn} onClick={logout}>Logout</button>
        </div>
      </header>

      {loading ? (
        <p>Loading...</p>
      ) : forms.length === 0 ? (
        <div style={styles.empty}>
          <p>No forms yet.</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/builder/new')}>Create your first form</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {forms.map(form => (
            <div key={form.id} style={styles.card}>
              {form.logoPath && (
                <img
                  src={`http://localhost:4000/uploads/${form.logoPath.split('/').pop()}`}
                  alt="logo"
                  style={styles.logo}
                />
              )}
              <h2 style={styles.formTitle}>{form.title}</h2>
              <p style={styles.meta}>{new Date(form.createdAt).toLocaleDateString()}</p>
              <div style={styles.cardActions}>
                <button style={styles.secondaryBtn} onClick={() => navigate(`/builder/${form.identifier}`)}>Edit</button>
                <button style={styles.ghostBtn} onClick={() => copyUrl(form.identifier)}>Copy URL</button>
                <button style={styles.ghostBtn} onClick={() => window.open(`/form/${form.identifier}`, '_blank')}>Preview</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  heading: { fontSize: '1.75rem', fontWeight: 700, margin: 0 },
  headerActions: { display: 'flex', gap: '0.75rem' },
  primaryBtn: { padding: '0.5rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  secondaryBtn: { padding: '0.4rem 0.9rem', background: '#ede9fe', color: '#4f46e5', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  ghostBtn: { padding: '0.4rem 0.9rem', background: 'none', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  logo: { width: '48px', height: '48px', objectFit: 'contain', borderRadius: '4px' },
  formTitle: { fontSize: '1.1rem', fontWeight: 600, margin: 0 },
  meta: { fontSize: '0.8rem', color: '#9ca3af', margin: 0 },
  cardActions: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' },
};
