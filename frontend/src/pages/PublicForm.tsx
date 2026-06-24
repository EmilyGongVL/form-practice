import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form } from '@formio/react';
import axios from 'axios';

interface FormRecord {
  title: string;
  schema: object;
  logoUrl?: string;
  logoAlign?: string;
  bgColor?: string;
  bgImageUrl?: string;
  bannerImageUrl?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderStyle?: string;
  borderColor?: string;
  cardShadow?: string;
  btnColor?: string;
}

interface Submission {
  data: Record<string, unknown>;
}

const SHADOWS: Record<string, string> = {
  none: 'none',
  sm:   '0 1px 4px rgba(0,0,0,0.06)',
  md:   '0 2px 12px rgba(0,0,0,0.08)',
  lg:   '0 4px 24px rgba(0,0,0,0.18)',
};

const inIframe = window.self !== window.top;

export default function PublicForm() {
  const { identifier } = useParams();
  const [formRecord, setFormRecord] = useState<FormRecord | null>(null);
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
    axios.get<FormRecord>(`http://localhost:4000/api/forms/${identifier}`)
      .then(({ data }) => setFormRecord(data))
      .catch(() => setError('Form not found.'));
  }, [identifier]);

  async function handleSubmit(submission: Submission) {
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

  if (!formRecord) {
    return <div style={styles.center}><p>Loading form...</p></div>;
  }

  if (submitted) {
    const successMsg = (formRecord as { successMessage?: string }).successMessage;
    return (
      <div style={styles.center}>
        <div style={styles.successCard}>
          <h2 style={styles.successTitle}>Thank you!</h2>
          <p>{successMsg || 'Your response has been submitted.'}</p>
        </div>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    borderRadius: `${formRecord.borderRadius ?? 8}px`,
    boxShadow: SHADOWS[formRecord.cardShadow ?? 'md'] ?? SHADOWS.md,
    ...(formRecord.borderWidth && formRecord.borderWidth > 0 ? {
      border: `${formRecord.borderWidth}px ${formRecord.borderStyle || 'solid'} ${formRecord.borderColor || '#000'}`,
    } : {}),
    ...(formRecord.bgImageUrl ? {
      backgroundImage: `url(${formRecord.bgImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : formRecord.bgColor ? { background: formRecord.bgColor } : {}),
  };

  const radius = formRecord.borderRadius ?? 8;
  const btnStyle = formRecord.btnColor
    ? `.btn-primary { background-color: ${formRecord.btnColor} !important; border-color: ${formRecord.btnColor} !important; color: #fff !important; }`
    : null;

  return (
    <div style={{ ...styles.page, ...(inIframe ? { background: 'transparent' } : {}) }}>
      {btnStyle && <style>{btnStyle}</style>}
      <div style={{ ...styles.card, ...cardStyle }}>
        {formRecord.bannerImageUrl && (
          <img
            src={formRecord.bannerImageUrl}
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
        {formRecord.logoUrl && (
          <div style={{ textAlign: (formRecord.logoAlign as React.CSSProperties['textAlign']) || 'left', marginBottom: '1rem' }}>
            <img src={formRecord.logoUrl} alt="logo" style={styles.logo} />
          </div>
        )}
        <h1 style={styles.title}>{formRecord.title}</h1>
        <Form form={formRecord.schema} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '3rem 1rem', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)' },
  card: { borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '640px' },
  logo: { width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px' },
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' },
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626', fontSize: '1.1rem' },
  successCard: { background: '#fff', borderRadius: '8px', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  successTitle: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#059669' },
};
