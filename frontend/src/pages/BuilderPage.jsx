import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function BuilderPage() {
  const { identifier } = useParams();
  const isNew = identifier === 'new';
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [bgImageFile, setBgImageFile] = useState(null);
  const [bgImagePreview, setBgImagePreview] = useState(null);
  const [savedIdentifier, setSavedIdentifier] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const builderRef = useRef(null);
  const builderInstanceRef = useRef(null);
  const initialSchemaRef = useRef({ components: [] });

  useEffect(() => {
    if (!isNew) {
      api.get(`/forms/${identifier}`).then(({ data }) => {
        setTitle(data.title);
        if (data.logoUrl) setLogoPreview(data.logoUrl);
        if (data.bgColor) setBgColor(data.bgColor);
        if (data.bgImageUrl) setBgImagePreview(data.bgImageUrl);
        initialSchemaRef.current = data.schema;
        mountBuilder(data.schema);
      });
    } else {
      mountBuilder({ components: [] });
    }

    return () => {
      if (builderInstanceRef.current) {
        builderInstanceRef.current.destroy();
        builderInstanceRef.current = null;
      }
    };
  }, [identifier]);

  function mountBuilder(schema) {
    if (!builderRef.current) return;

    const hiddenTabs = { ignore: true };
    const options = {
      editForm: {
        textfield:  [{ key: 'data', ...hiddenTabs }, { key: 'api', ...hiddenTabs }, { key: 'conditional', ...hiddenTabs }, { key: 'logic', ...hiddenTabs }, { key: 'layout', ...hiddenTabs }],
        textarea:   [{ key: 'data', ...hiddenTabs }, { key: 'api', ...hiddenTabs }, { key: 'conditional', ...hiddenTabs }, { key: 'logic', ...hiddenTabs }, { key: 'layout', ...hiddenTabs }],
        email:      [{ key: 'data', ...hiddenTabs }, { key: 'api', ...hiddenTabs }, { key: 'conditional', ...hiddenTabs }, { key: 'logic', ...hiddenTabs }, { key: 'layout', ...hiddenTabs }],
        phoneNumber:[{ key: 'data', ...hiddenTabs }, { key: 'api', ...hiddenTabs }, { key: 'conditional', ...hiddenTabs }, { key: 'logic', ...hiddenTabs }, { key: 'layout', ...hiddenTabs }],
        number:     [{ key: 'data', ...hiddenTabs }, { key: 'api', ...hiddenTabs }, { key: 'conditional', ...hiddenTabs }, { key: 'logic', ...hiddenTabs }, { key: 'layout', ...hiddenTabs }],
        select:     [{ key: 'data', ignore: false }, { key: 'api', ...hiddenTabs }, { key: 'conditional', ...hiddenTabs }, { key: 'logic', ...hiddenTabs }, { key: 'layout', ...hiddenTabs }],
        checkbox:   [{ key: 'data', ...hiddenTabs }, { key: 'api', ...hiddenTabs }, { key: 'conditional', ...hiddenTabs }, { key: 'logic', ...hiddenTabs }, { key: 'layout', ...hiddenTabs }],
        radio:      [{ key: 'data', ignore: false }, { key: 'api', ...hiddenTabs }, { key: 'conditional', ...hiddenTabs }, { key: 'logic', ...hiddenTabs }, { key: 'layout', ...hiddenTabs }],
      },
    };

    window.Formio.builder(builderRef.current, schema, options).then((builder) => {
      builderInstanceRef.current = builder;
    });
  }

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleBgImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBgImageFile(file);
    setBgImagePreview(URL.createObjectURL(file));
  }

  function clearBgImage() {
    setBgImageFile(null);
    setBgImagePreview(null);
  }

  async function handleSave() {
    if (!title.trim()) return setError('Please enter a form title.');
    setError('');
    setSaving(true);

    const schema = builderInstanceRef.current
      ? builderInstanceRef.current.schema
      : initialSchemaRef.current;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('schema', JSON.stringify(schema));
    formData.append('bgColor', bgColor);
    if (logoFile) formData.append('logo', logoFile);
    if (bgImageFile) formData.append('bgImage', bgImageFile);

    try {
      if (isNew) {
        const { data } = await api.post('/forms', formData);
        setSavedIdentifier(data.identifier);
      } else {
        await api.patch(`/forms/${identifier}`, formData);
        setSavedIdentifier(identifier);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function copyPublicUrl() {
    navigator.clipboard.writeText(`${window.location.origin}/form/${savedIdentifier}`);
  }

  const bgPreviewStyle = bgImagePreview
    ? { backgroundImage: `url(${bgImagePreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: bgColor };

  return (
    <div style={styles.page}>
      <div style={styles.toolbar}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <h1 style={styles.heading}>{isNew ? 'New Form' : 'Edit Form'}</h1>
        <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Form'}
        </button>
      </div>

      <div style={styles.meta}>
        <div style={styles.field}>
          <label style={styles.label}>Form Title</label>
          <input
            style={styles.input}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter form title..."
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Logo</label>
          <input type="file" accept="image/*" onChange={handleLogoChange} />
          {logoPreview && <img src={logoPreview} alt="logo preview" style={styles.logoPreview} />}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Background Colour</label>
          <div style={styles.colorRow}>
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={styles.colorPicker} />
            <span style={styles.colorHex}>{bgColor}</span>
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Background Image <span style={styles.hint}>(overrides colour)</span></label>
          <input type="file" accept="image/*" onChange={handleBgImageChange} />
          {bgImagePreview && (
            <div style={styles.bgPreviewWrap}>
              <div style={{ ...styles.bgPreview, ...bgPreviewStyle }} />
              <button style={styles.clearBtn} onClick={clearBgImage}>✕ Remove</button>
            </div>
          )}
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {savedIdentifier && (
        <div style={styles.successBanner}>
          <span>Form saved! Public URL: <strong>{window.location.origin}/form/{savedIdentifier}</strong></span>
          <button style={styles.copyBtn} onClick={copyPublicUrl}>Copy</button>
        </div>
      )}

      <div style={styles.builderWrap}>
        <div ref={builderRef} />
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' },
  toolbar: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  backBtn: { padding: '0.4rem 0.8rem', background: 'none', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' },
  heading: { flex: 1, fontSize: '1.5rem', fontWeight: 700, margin: 0 },
  saveBtn: { padding: '0.5rem 1.5rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  meta: { display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontWeight: 600, fontSize: '0.875rem' },
  hint: { fontWeight: 400, color: '#9ca3af', fontSize: '0.8rem' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', minWidth: '280px' },
  logoPreview: { width: '64px', height: '64px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #eee' },
  colorRow: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  colorPicker: { width: '48px', height: '36px', padding: '2px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' },
  colorHex: { fontSize: '0.875rem', color: '#555', fontFamily: 'monospace' },
  bgPreviewWrap: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' },
  bgPreview: { width: '80px', height: '50px', borderRadius: '4px', border: '1px solid #ddd' },
  clearBtn: { padding: '0.25rem 0.6rem', background: 'none', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626' },
  error: { color: '#dc2626', marginBottom: '1rem' },
  successBanner: { background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '6px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  copyBtn: { padding: '0.3rem 0.8rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  builderWrap: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' },
};
