import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Toast({ message, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [onHide]);
  return (
    <div style={s.toast}>{message}</div>
  );
}

function EmbedModal({ form, onClose }) {
  const origin = window.location.origin;
  const code = `<iframe style="width: 100%; min-height: 500px; height: auto; border: none;" scrolling="auto" allowtransparency="true" allowfullscreen="true" src="${origin}/form/${form.identifier}"></iframe>`;
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>Embed Code</h2>
          <button style={s.closeX} onClick={onClose}>✕</button>
        </div>
        <div style={s.codeBlock}>
          <code style={s.codeText}>{code}</code>
        </div>
        <div style={s.modalActions}>
          <button style={s.copyCodeBtn} onClick={copyCode}>
            ⧉ {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
        <div style={s.modalFooter}>
          <button style={s.closeBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ActionsMenu({ form, onAction }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = [
    { label: 'Edit Form', action: 'edit' },
    { label: 'View Form', action: 'view' },
    { label: 'View Submissions', action: 'submissions' },
    { label: 'Duplicate', action: 'duplicate' },
    { label: 'Copy Form Link', action: 'copy' },
    { label: 'Embed Code', action: 'embed' },
    { label: 'Delete', action: 'delete', danger: true },
  ];

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button style={s.dotsBtn} onClick={() => setOpen(o => !o)}>⋮</button>
      {open && (
        <div style={s.dropdown}>
          {items.map(({ label, action, danger }) => (
            <button
              key={action}
              style={{ ...s.dropdownItem, ...(danger ? s.dangerItem : {}) }}
              onClick={() => { setOpen(false); onAction(action, form); }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FormList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [embedForm, setEmbedForm] = useState(null);
  const navigate = useNavigate();

  function showToast(message) {
    setToast(message);
  }

  async function loadForms() {
    const { data } = await api.get('/forms');
    setForms(data);
    setLoading(false);
  }

  useEffect(() => { loadForms(); }, []);

  async function handleAction(action, form) {
    switch (action) {
      case 'edit':
        navigate(`/builder/${form.identifier}`);
        break;
      case 'view':
        window.open(`/form/${form.identifier}`, '_blank');
        break;
      case 'submissions':
        navigate(`/submissions/${form.identifier}`);
        break;
      case 'duplicate': {
        await api.post(`/forms/${form.identifier}/duplicate`);
        await loadForms();
        showToast('Form duplicated');
        break;
      }
      case 'copy': {
        const url = `${window.location.origin}/form/${form.identifier}`;
        navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard');
        break;
      }
      case 'embed':
        setEmbedForm(form);
        break;
      case 'delete': {
        if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) break;
        await api.delete(`/forms/${form.identifier}`);
        await loadForms();
        showToast('Form deleted');
        break;
      }
    }
  }

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <h1 style={s.heading}>My Forms</h1>
        <div style={s.headerActions}>
          <button style={s.primaryBtn} onClick={() => navigate('/builder/new')}>+ New Form</button>
          <button style={s.ghostBtn} onClick={logout}>Logout</button>
        </div>
      </header>

      {loading ? (
        <p style={{ padding: '2rem', color: '#6b7280' }}>Loading...</p>
      ) : forms.length === 0 ? (
        <div style={s.empty}>
          <p>No forms yet.</p>
          <button style={s.primaryBtn} onClick={() => navigate('/builder/new')}>Create your first form</button>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Name', 'Type', 'Status', 'Submissions', 'Added', 'Actions'].map(col => (
                  <th key={col} style={s.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {forms.map(form => (
                <tr key={form.id} style={s.tr}>
                  <td style={s.td}>
                    <span style={s.formName}>{form.title}</span>
                  </td>
                  <td style={s.td}>{form.formType}</td>
                  <td style={s.td}>
                    <span style={s.liveBadge}>● Live</span>
                  </td>
                  <td style={s.td}>{form._count.leads}</td>
                  <td style={s.td}>{new Date(form.createdAt).toLocaleDateString()}</td>
                  <td style={s.td}>
                    <ActionsMenu form={form} onAction={handleAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <Toast message={toast} onHide={() => setToast(null)} />}
      {embedForm && <EmbedModal form={embedForm} onClose={() => setEmbedForm(null)} />}
    </div>
  );
}

const s = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  heading: { fontSize: '1.75rem', fontWeight: 700, margin: 0 },
  headerActions: { display: 'flex', gap: '0.75rem' },
  primaryBtn: { padding: '0.5rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  ghostBtn: { padding: '0.5rem 1rem', background: 'none', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  tableWrap: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.85rem 1rem', verticalAlign: 'middle', color: '#374151' },
  formName: { fontWeight: 600, color: '#111' },
  liveBadge: { color: '#16a34a', fontWeight: 600, fontSize: '0.8rem' },
  dotsBtn: { background: 'none', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '0.2rem 0.6rem', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 },
  dropdown: { position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 100, minWidth: '170px', overflow: 'hidden' },
  dropdownItem: { display: 'block', width: '100%', padding: '0.55rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' },
  dangerItem: { color: '#dc2626' },
  toast: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: '#1f2937', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '6px', fontSize: '0.875rem', zIndex: 999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: '8px', width: '680px', maxWidth: '95vw', padding: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { fontSize: '1.25rem', fontWeight: 700, margin: 0 },
  closeX: { background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6b7280' },
  codeBlock: { background: '#f3f4f6', borderRadius: '6px', padding: '1.25rem', marginBottom: '1rem', overflowX: 'auto' },
  codeText: { fontFamily: 'monospace', fontSize: '0.85rem', color: '#be185d', whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
  modalActions: { marginBottom: '1rem' },
  copyCodeBtn: { padding: '0.5rem 1.1rem', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end' },
  closeBtn: { padding: '0.5rem 1.25rem', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },
};
