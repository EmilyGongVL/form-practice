import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function BuilderPage() {
  const { identifier } = useParams();
  const isNew = identifier === "new";
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [formType, setFormType] = useState("Lead Form");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bgTransparent, setBgTransparent] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgImageFile, setBgImageFile] = useState(null);
  const [bgImagePreview, setBgImagePreview] = useState(null);
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderStyle, setBorderStyle] = useState("solid");
  const [borderRadius, setBorderRadius] = useState(8);
  const [cardShadow, setCardShadow] = useState("md");
  const [bannerFile,    setBannerFile]    = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [savedIdentifier, setSavedIdentifier] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const builderRef = useRef(null);
  const builderInstanceRef = useRef(null);
  const initialSchemaRef = useRef({ components: [] });

  useEffect(() => {
    if (!isNew) {
      api.get(`/forms/${identifier}`).then(({ data }) => {
        setTitle(data.title);
        if (data.formType) setFormType(data.formType);
        if (data.logoUrl) setLogoPreview(data.logoUrl);
        if (data.bgColor) {
          setBgColor(data.bgColor);
        } else if (!data.bgImageUrl) {
          setBgTransparent(true);
        }
        if (data.bgImageUrl) setBgImagePreview(data.bgImageUrl);
        if (data.borderColor != null) setBorderColor(data.borderColor);
        if (data.borderWidth != null) setBorderWidth(data.borderWidth);
        if (data.borderStyle != null) setBorderStyle(data.borderStyle);
        if (data.borderRadius != null) setBorderRadius(data.borderRadius);
        if (data.cardShadow != null) setCardShadow(data.cardShadow);
        if (data.bannerImageUrl) setBannerPreview(data.bannerImageUrl);
        initialSchemaRef.current = data.schema;
        mountBuilder(data.schema);
      });
    } else {
      mountBuilder({ components: [] });
    }

    return () => {
      if (builderInstanceRef.current) {
        if (builderInstanceRef.current._helpInterceptor) {
          document.removeEventListener(
            "click",
            builderInstanceRef.current._helpInterceptor,
            true,
          );
        }
        builderInstanceRef.current.destroy();
        builderInstanceRef.current = null;
      }
    };
  }, [identifier]);

  function mountBuilder(schema) {
    if (!builderRef.current) return;
    //customize form builder options to hide irrelevant tabs.
    const hiddenTabs = { ignore: false };
    const hiddenDisplayFields = {
      key: "display",
      components: [
        { key: "prefix", ignore: false },
        { key: "suffix", ignore: false },
        { key: "widget", ignore: false },
      ],
    };
    const options = {
      editForm: {
        textfield: [
          hiddenDisplayFields,
          { key: "data", ...hiddenTabs },
          { key: "api", ...hiddenTabs },
          { key: "conditional", ...hiddenTabs },
          { key: "logic", ...hiddenTabs },
          { key: "layout", ...hiddenTabs },
        ],
        textarea: [
          { key: "data", ...hiddenTabs },
          { key: "api", ...hiddenTabs },
          { key: "conditional", ...hiddenTabs },
          { key: "logic", ...hiddenTabs },
          { key: "layout", ...hiddenTabs },
        ],
        email: [
          hiddenDisplayFields,
          { key: "data", ...hiddenTabs },
          { key: "api", ...hiddenTabs },
          { key: "conditional", ...hiddenTabs },
          { key: "logic", ...hiddenTabs },
          { key: "layout", ...hiddenTabs },
        ],
        phoneNumber: [
          hiddenDisplayFields,
          { key: "data", ...hiddenTabs },
          { key: "api", ...hiddenTabs },
          { key: "conditional", ...hiddenTabs },
          { key: "logic", ...hiddenTabs },
          { key: "layout", ...hiddenTabs },
        ],
        number: [
          hiddenDisplayFields,
          { key: "data", ...hiddenTabs },
          { key: "api", ...hiddenTabs },
          { key: "conditional", ...hiddenTabs },
          { key: "logic", ...hiddenTabs },
          { key: "layout", ...hiddenTabs },
        ],
        select: [
          { key: "data", ignore: false },
          { key: "api", ...hiddenTabs },
          { key: "conditional", ...hiddenTabs },
          { key: "logic", ...hiddenTabs },
          { key: "layout", ...hiddenTabs },
        ],
        checkbox: [
          { key: "data", ...hiddenTabs },
          { key: "api", ...hiddenTabs },
          { key: "conditional", ...hiddenTabs },
          { key: "logic", ...hiddenTabs },
          { key: "layout", ...hiddenTabs },
        ],
        radio: [
          { key: "data", ignore: false },
          { key: "api", ...hiddenTabs },
          { key: "conditional", ...hiddenTabs },
          { key: "logic", ...hiddenTabs },
          { key: "layout", ...hiddenTabs },
        ],
      },
    };

    window.Formio.builder(builderRef.current, schema, options).then(
      (builder) => {
        builderInstanceRef.current = builder;

        const interceptHelp = (e) => {
          const link = e.target.closest(
            'a[href*="help.form.io"], a[href*="form.io/developers"]',
          );
          if (link) {
            e.preventDefault();
            e.stopPropagation();
            window.open("/help", "_blank");
          }
        };
        document.addEventListener("click", interceptHelp, true);
        builder._helpInterceptor = interceptHelp;
      },
    );
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
    if (!title.trim()) return setError("Please enter a form title.");
    setError("");
    setSaving(true);

    const schema = builderInstanceRef.current
      ? builderInstanceRef.current.schema
      : initialSchemaRef.current;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("formType", formType);
    formData.append("schema", JSON.stringify(schema));
    if (bgTransparent) {
      formData.append("bgColor", "");
      formData.append("removeBgImage", "true");
    } else {
      formData.append("bgColor", bgColor);
      if (bgImageFile) formData.append("bgImage", bgImageFile);
    }
    if (logoFile) formData.append("logo", logoFile);
    if (bannerFile) formData.append("banner", bannerFile);
    if (!bannerPreview && !bannerFile) formData.append("removeBanner", "true");
    formData.append("borderColor", borderColor);
    formData.append("borderWidth", borderWidth);
    formData.append("borderStyle", borderStyle);
    formData.append("borderRadius", borderRadius);
    formData.append("cardShadow", cardShadow);

    try {
      if (isNew) {
        const { data } = await api.post("/forms", formData);
        setSavedIdentifier(data.identifier);
      } else {
        await api.patch(`/forms/${identifier}`, formData);
        setSavedIdentifier(identifier);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function copyPublicUrl() {
    navigator.clipboard.writeText(
      `${window.location.origin}/form/${savedIdentifier}`,
    );
  }

  const bgPreviewStyle = bgImagePreview
    ? {
        backgroundImage: `url(${bgImagePreview})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: bgColor };

  return (
    <div style={styles.page}>
      <div style={styles.toolbar}>
        <button style={styles.backBtn} onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1 style={styles.heading}>{isNew ? "New Form" : "Edit Form"}</h1>
        <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Form"}
        </button>
      </div>

      <div style={styles.meta}>
        <div style={styles.field}>
          <label style={styles.label}>Form Title</label>
          <input
            style={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter form title..."
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Form Type</label>
          <select
            style={styles.input}
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
          >
            {[
              "Lead Form",
              "Contact Form",
              "Survey",
              "Event Registration",
              "Other",
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Logo</label>
          <input type="file" accept="image/*" onChange={handleLogoChange} />
          {logoPreview && (
            <img
              src={logoPreview}
              alt="logo preview"
              style={styles.logoPreview}
            />
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            Banner Image <span style={styles.hint}>(full-width, top of card)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              setBannerFile(file);
              setBannerPreview(URL.createObjectURL(file));
            }}
          />
          {bannerPreview && (
            <div style={styles.bgPreviewWrap}>
              <img src={bannerPreview} alt="banner preview" style={styles.bannerPreview} />
              <button
                style={styles.clearBtn}
                onClick={() => { setBannerFile(null); setBannerPreview(null); }}
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Card Background</label>
          <label style={styles.checkRow}>
            <input
              type="checkbox"
              checked={bgTransparent}
              onChange={(e) => {
                setBgTransparent(e.target.checked);
                if (e.target.checked) {
                  setBgImageFile(null);
                  setBgImagePreview(null);
                }
              }}
            />
            <span style={{ fontSize: "0.875rem" }}>Transparent</span>
          </label>
          {!bgTransparent && (
            <>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={styles.colorPicker}
                />
                <span style={styles.colorHex}>{bgColor}</span>
              </div>
              <span style={{ ...styles.hint, marginTop: "0.25rem" }}>
                or upload an image (overrides colour)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBgImageChange}
              />
              {bgImagePreview && (
                <div style={styles.bgPreviewWrap}>
                  <div style={{ ...styles.bgPreview, ...bgPreviewStyle }} />
                  <button style={styles.clearBtn} onClick={clearBgImage}>
                    ✕ Remove
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Card Border &amp; Shadow</label>
          <div style={styles.borderGrid}>
            <div style={styles.borderField}>
              <span style={styles.subLabel}>Width (px)</span>
              <input
                type="number"
                min="0"
                max="10"
                style={{ ...styles.input, minWidth: "70px" }}
                value={borderWidth}
                onChange={(e) => setBorderWidth(Number(e.target.value))}
              />
            </div>
            <div style={styles.borderField}>
              <span style={styles.subLabel}>Style</span>
              <select
                style={{ ...styles.input, minWidth: "90px" }}
                value={borderStyle}
                onChange={(e) => setBorderStyle(e.target.value)}
              >
                {["solid", "dashed", "dotted"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.borderField}>
              <span style={styles.subLabel}>Colour</span>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                style={styles.colorPicker}
              />
            </div>
            <div style={styles.borderField}>
              <span style={styles.subLabel}>Radius (px)</span>
              <input
                type="number"
                min="0"
                max="50"
                style={{ ...styles.input, minWidth: "70px" }}
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
              />
            </div>
            <div style={styles.borderField}>
              <span style={styles.subLabel}>Shadow</span>
              <select
                style={{ ...styles.input, minWidth: "100px" }}
                value={cardShadow}
                onChange={(e) => setCardShadow(e.target.value)}
              >
                <option value="none">None</option>
                <option value="sm">Light</option>
                <option value="md">Medium</option>
                <option value="lg">Strong</option>
              </select>
            </div>
          </div>
          <div
            style={{
              marginTop: "0.5rem",
              width: "80px",
              height: "50px",
              borderRadius: `${borderRadius}px`,
              border:
                borderWidth > 0
                  ? `${borderWidth}px ${borderStyle} ${borderColor}`
                  : "1px solid #e5e7eb",
              background: "#fff",
              boxShadow:
                {
                  none: "none",
                  sm: "0 1px 4px rgba(0,0,0,0.06)",
                  md: "0 2px 12px rgba(0,0,0,0.08)",
                  lg: "0 4px 24px rgba(0,0,0,0.18)",
                }[cardShadow] ?? "none",
            }}
          />
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {savedIdentifier && (
        <div style={styles.successBanner}>
          <span>
            Form saved! Public URL:{" "}
            <strong>
              {window.location.origin}/form/{savedIdentifier}
            </strong>
          </span>
          <button style={styles.copyBtn} onClick={copyPublicUrl}>
            Copy
          </button>
        </div>
      )}

      <div style={styles.builderWrap}>
        <div ref={builderRef} />
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  backBtn: {
    padding: "0.4rem 0.8rem",
    background: "none",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
  },
  heading: { flex: 1, fontSize: "1.5rem", fontWeight: 700, margin: 0 },
  saveBtn: {
    padding: "0.5rem 1.5rem",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: 600,
  },
  meta: {
    display: "flex",
    gap: "2rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontWeight: 600, fontSize: "0.875rem" },
  hint: { fontWeight: 400, color: "#9ca3af", fontSize: "0.8rem" },
  input: {
    padding: "0.5rem 0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    minWidth: "280px",
  },
  logoPreview: {
    width: "64px",
    height: "64px",
    objectFit: "contain",
    borderRadius: "4px",
    border: "1px solid #eee",
  },
  colorRow: { display: "flex", alignItems: "center", gap: "0.6rem" },
  colorPicker: {
    width: "48px",
    height: "36px",
    padding: "2px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
  },
  colorHex: { fontSize: "0.875rem", color: "#555", fontFamily: "monospace" },
  bgPreviewWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "0.25rem",
  },
  bgPreview: {
    width: "80px",
    height: "50px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  bannerPreview: {
    width: '240px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #eee',
  },
  clearBtn: {
    padding: "0.25rem 0.6rem",
    background: "none",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    color: "#dc2626",
  },
  error: { color: "#dc2626", marginBottom: "1rem" },
  successBanner: {
    background: "#d1fae5",
    border: "1px solid #6ee7b7",
    borderRadius: "6px",
    padding: "0.75rem 1rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  copyBtn: {
    padding: "0.3rem 0.8rem",
    background: "#059669",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  builderWrap: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "1rem",
  },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    cursor: "pointer",
  },
  borderGrid: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  borderField: { display: "flex", flexDirection: "column", gap: "0.25rem" },
  subLabel: { fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 },
};
