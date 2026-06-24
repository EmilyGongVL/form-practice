import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form } from '@formio/react';
import axios from 'axios';

const SHADOWS = {
  none: 'none',
  sm:   '0 1px 4px rgba(0,0,0,0.06)',
  md:   '0 2px 12px rgba(0,0,0,0.08)',
  lg:   '0 4px 24px rgba(0,0,0,0.18)',
};

const inIframe = window.self !== window.top;

export default function PublicForm() {
  const { identifier } = useParams();
  const [formData, setFormData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (inIframe) {
      const prev = document.body.style.background;
      document.body.style.background = 'transparent';
      return () => { document.body.style.background = prev; };
    }
  }, []);

  useEffect(() => {
    axios.get(`http://localhost:4000/api/forms/${identifier}`)
      .then(({ data }) => setFormData(data))
      .catch(() => setError('Form not found.'));
  }, [identifier]);

  async function handleSubmit(submission) {
    try {
      await axios.post(`http://localhost:4000/api/forms/${identifier}/submit`, submission.data);
      setSubmitted(true);
    } catch {
      setError('Submission failed. Please try again.');
    }
  }

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

  const radius = formData.borderRadius ?? 8;
  const btnStyle = formData.btnColor
    ? `.btn-primary { background-color: ${formData.btnColor} !important; border-color: ${formData.btnColor} !important; color: #fff !important; }`
    : null;

  return (
    <div style={{ ...styles.page, ...(inIframe ? { background: 'transparent' } : {}) }}>
      {btnStyle && <style>{btnStyle}</style>}
      <div style={{ ...styles.card, ...cardStyle }}>
        {formData.bannerImageUrl && (
          <img
            src={formData.bannerImageUrl}
            alt="banner"
            style={{
              display: 'block',
              width: 'calc(100% + 4rem)',
              height: '160px',
              objectFit: 'cover',
              borderRadius: `${radius}px ${radius}px 0 0`,
              margin: '-2rem -2rem 1.5rem -2rem',
            }}
          />
        )}
        {formData.logoUrl && (
          <div style={{ textAlign: formData.logoAlign || 'left', marginBottom: '1rem' }}>
            <img src={formData.logoUrl} alt="logo" style={styles.logo} />
          </div>
        )}
        <h1 style={styles.title}>{formData.title}</h1>
        <Form form={formData.schema} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '3rem 1rem', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)' },
  card: { borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '640px' },
  logo: { width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px' },
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' },
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626', fontSize: '1.1rem' },
  successCard: { background: '#fff', borderRadius: '8px', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  successTitle: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#059669' },
};
