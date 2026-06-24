import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

interface Lead {
  id: string;
  createdAt: string;
  data: Record<string, unknown>;
}

interface SubmissionsResponse {
  title: string;
  leads: Lead[];
}

export default function SubmissionsPage() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<SubmissionsResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<SubmissionsResponse>(`/forms/${identifier}/submissions`)
      .then(({ data }) => setSubmissions(data))
      .catch(() => setError('Could not load submissions.'));
  }, [identifier]);

  if (error) return <div style={s.center}><p style={{ color: '#dc2626' }}>{error}</p></div>;
  if (!submissions) return <div style={s.center}><p>Loading...</p></div>;

  const { title, leads } = submissions;
  const allKeys = leads.length > 0
    ? [...new Set(leads.flatMap(l => Object.keys(l.data)))]
    : [];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Back</button>
        <h1 style={s.heading}>Submissions — {title}</h1>
        <span style={s.count}>{leads.length} submission{leads.length !== 1 ? 's' : ''}</span>
      </div>

      {leads.length === 0 ? (
        <div style={s.empty}>No submissions yet.</div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>#</th>
                <th style={s.th}>Submitted</th>
                {allKeys.map(k => <th key={k} style={s.th}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr key={lead.id} style={s.tr}>
                  <td style={s.td}>{leads.length - i}</td>
                  <td style={s.td}>{new Date(lead.createdAt).toLocaleString()}</td>
                  {allKeys.map(k => (
                    <td key={k} style={s.td}>
                      {lead.data[k] !== undefined ? String(lead.data[k]) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  backBtn: { padding: '0.4rem 0.8rem', background: 'none', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' },
  heading: { flex: 1, fontSize: '1.5rem', fontWeight: 700, margin: 0 },
  count: { color: '#6b7280', fontSize: '0.875rem' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  empty: { textAlign: 'center', padding: '4rem', color: '#6b7280' },
  tableWrap: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.75rem 1rem', color: '#374151', verticalAlign: 'top' },
};
