import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SHADOWS = {
  none: 'none',
  sm:   '0 1px 4px rgba(0,0,0,0.06)',
  md:   '0 2px 12px rgba(0,0,0,0.08)',
  lg:   '0 4px 24px rgba(0,0,0,0.18)',
};

export default function PublicForm() {
  const { identifier } = useParams();
  const [formData, setFormData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const formInstanceRef = useRef(null);

  useEffect(() => {
    axios.get(`http://localhost:4000/api/forms/${identifier}`)
      .then(({ data }) => setFormData(data))
      .catch(() => setError('Form not found.'));
  }, [identifier]);

  useEffect(() => {
    if (!formData || !formRef.current) return;

    window.Formio.createForm(formRef.current, formData.schema).then((form) => {
      formInstanceRef.current = form;
      form.on('submit', async (submission) => {
        try {
          await axios.post(`http://localhost:4000/api/forms/${identifier}/submit`, submission.data);
          setSubmitted(true);
        } catch {
          setError('Submission failed. Please try again.');
        }
      });
    });

    return () => {
      if (formInstanceRef.current) {
        formInstanceRef.current.destroy();
        formInstanceRef.current = null;
      }
    };
  }, [formData]);

  if (error) {
    return <div style={styles.center}><p style={styles.error}>{error}</p></div>;
  }

  if (!formData) {
    return <div style={styles.center}><p>Loading form...</p></div>;
  }

  if (submitted) {
    return (
      <div style={styles.center}>
        <div style={styles.successCard}>
          <h2 style={styles.successTitle}>Thank you!</h2>
          <p>Your response has been submitted.</p>
        </div>
      </div>
    );
  }

  const cardStyle = {
    borderRadius: `${formData.borderRadius ?? 8}px`,
    boxShadow: SHADOWS[formData.cardShadow] ?? SHADOWS.md,
    ...(formData.borderWidth > 0 ? {
      border: `${formData.borderWidth}px ${formData.borderStyle || 'solid'} ${formData.borderColor || '#000'}`,
    } : {}),
    ...(formData.bgImageUrl ? {
      backgroundImage: `url(${formData.bgImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : formData.bgColor ? { background: formData.bgColor } : {}),
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, ...cardStyle }}>
        {formData.logoUrl && (
          <img src={formData.logoUrl} alt="logo" style={styles.logo} />
        )}
        <h1 style={styles.title}>{formData.title}</h1>
        <div ref={formRef} />
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '3rem 1rem', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)' },
  card: { borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '640px' },
  logo: { width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1rem', borderRadius: '4px' },
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' },
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626', fontSize: '1.1rem' },
  successCard: { background: '#fff', borderRadius: '8px', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  successTitle: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#059669' },
};
