import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../api";

const FORM_TYPES = ["Standard Form", "Leads Signup", "NPS Survey"];

const schema = z
  .object({
    title: z.string().min(1, "Form Name is required"),
    formType: z.enum(FORM_TYPES),
    formStatus: z.enum(["live", "paused"]),
    venueName: z.string(),
    sourceGroup: z.string().min(1, "Source Group is required"),
    sourceName: z.string().min(1, "Source Name is required"),
    assignLeadsTo: z.string(),
    redirectLink: z.union([
      z.string().url("Must be a valid URL"),
      z.literal(""),
    ]),
    submissionCopyTo: z.union([
      z.string().email("Must be a valid email"),
      z.literal(""),
    ]),
    successMessage: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.formType === "Leads Signup" && !data.venueName.trim()) {
      ctx.addIssue({
        path: ["venueName"],
        code: z.ZodIssueCode.custom,
        message: "Venue Name is required for Leads Signup forms",
      });
    }
  });

export default function BuilderPage() {
  const { identifier } = useParams();
  const isNew = identifier === "new";
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      formType: "Standard Form",
      formStatus: "live",
      venueName: "",
      sourceGroup: "",
      sourceName: "",
      assignLeadsTo: "",
      redirectLink: "",
      submissionCopyTo: "",
      successMessage: "",
    },
  });

  const formType = watch("formType");

  // Design settings
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoAlign, setLogoAlign] = useState("left");
  const [removeLogo, setRemoveLogo] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bgTransparent, setBgTransparent] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgImageFile, setBgImageFile] = useState(null);
  const [bgImagePreview, setBgImagePreview] = useState(null);
  const [btnColorEnabled, setBtnColorEnabled] = useState(false);
  const [btnColor, setBtnColor] = useState("#0d6efd");
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderStyle, setBorderStyle] = useState("solid");
  const [borderRadius, setBorderRadius] = useState(8);
  const [cardShadow, setCardShadow] = useState("md");

  const [serverError, setServerError] = useState("");
  const builderRef = useRef(null);
  const builderInstanceRef = useRef(null);
  const initialSchemaRef = useRef({ components: [] });

  useEffect(() => {
    if (!isNew) {
      api.get(`/forms/${identifier}`).then(({ data }) => {
        reset({
          title: data.title || "",
          formType: FORM_TYPES.includes(data.formType)
            ? data.formType
            : "Standard Form",
          formStatus: data.formStatus || "live",
          venueName: data.venueName || "",
          sourceGroup: data.sourceGroup || "",
          sourceName: data.sourceName || "",
          assignLeadsTo: data.assignLeadsTo || "",
          redirectLink: data.redirectLink || "",
          submissionCopyTo: data.submissionCopyTo || "",
          successMessage: data.successMessage || "",
        });
        if (data.logoUrl) setLogoPreview(data.logoUrl);
        if (data.logoAlign) setLogoAlign(data.logoAlign);
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
        if (data.btnColor) {
          setBtnColor(data.btnColor);
          setBtnColorEnabled(true);
        }
        initialSchemaRef.current = data.schema;
        mountBuilder(data.schema);
      });
    } else {
      mountBuilder({
        components: [
          {
            type: "textfield",
            label: "First Name",
            key: "firstName",
            placeholder: "Enter first name",
            validate: { required: true },
          },
          {
            type: "textfield",
            label: "Last Name",
            key: "lastName",
            placeholder: "Enter last name",
            validate: { required: true },
          },
          {
            type: "email",
            label: "Email",
            key: "email",
            placeholder: "Enter email address",
            validate: { required: true },
          },
          {
            type: "phoneNumber",
            label: "Phone Number",
            key: "phone",
            placeholder: "Enter phone number",
            validate: { required: true },
          },
        ],
      });
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
      builder: {
        predefined: {
          title: "Predefined Fields",
          weight: 0,
          default: true,
          components: {
            firstName: {
              title: "First Name",
              key: "firstName",
              icon: "terminal",
              schema: {
                type: "textfield",
                label: "First Name",
                key: "firstName",
                placeholder: "Enter first name",
                validate: { required: true },
              },
            },
            lastName: {
              title: "Last Name",
              key: "lastName",
              icon: "terminal",
              schema: {
                type: "textfield",
                label: "Last Name",
                key: "lastName",
                placeholder: "Enter last name",
                validate: { required: true },
              },
            },
            email: {
              title: "Email",
              key: "email",
              icon: "at",
              schema: {
                type: "email",
                label: "Email",
                key: "email",
                placeholder: "Enter email address",
                validate: { required: true },
              },
            },
            phone: {
              title: "Phone",
              key: "phone",
              icon: "phone-square",
              schema: {
                type: "phoneNumber",
                label: "Phone Number",
                key: "phone",
                placeholder: "Enter phone number",
              },
            },
            gender: {
              title: "Gender",
              key: "gender",
              icon: "list",
              schema: {
                type: "select",
                label: "Gender",
                key: "gender",
                placeholder: "Select gender",
                data: {
                  values: [
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                    { label: "Non-binary", value: "non-binary" },
                    { label: "Prefer not to say", value: "prefer_not_to_say" },
                  ],
                },
              },
            },
            dateOfBirth: {
              title: "Date of Birth",
              key: "dateOfBirth",
              icon: "calendar",
              schema: {
                type: "datetime",
                label: "Date of Birth",
                key: "dateOfBirth",
                format: "dd/MM/yyyy",
                enableTime: false,
                datePicker: { disableWeekends: false, disableWeekdays: false },
              },
            },
            waiver: {
              title: "Waiver",
              key: "waiver",
              icon: "file-text",
              schema: {
                type: "checkbox",
                label: "I agree to the terms and conditions",
                key: "waiver",
                validate: { required: true },
              },
            },
          },
        },
        basic: { default: false },
      },
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

  async function handleSave(fields) {
    setServerError("");

    const builderSchema = builderInstanceRef.current
      ? builderInstanceRef.current.schema
      : initialSchemaRef.current;

    const formData = new FormData();
    formData.append("title", fields.title);
    formData.append("formType", fields.formType);
    formData.append("formStatus", fields.formStatus);
    formData.append("venueName", fields.venueName);
    formData.append("sourceGroup", fields.sourceGroup);
    formData.append("sourceName", fields.sourceName);
    formData.append("assignLeadsTo", fields.assignLeadsTo);
    formData.append("redirectLink", fields.redirectLink);
    formData.append("submissionCopyTo", fields.submissionCopyTo);
    formData.append("successMessage", fields.successMessage);
    formData.append("schema", JSON.stringify(builderSchema));
    if (bgTransparent) {
      formData.append("bgColor", "");
      formData.append("removeBgImage", "true");
    } else {
      formData.append("bgColor", bgColor);
      if (bgImageFile) formData.append("bgImage", bgImageFile);
    }
    if (logoFile) formData.append("logo", logoFile);
    if (removeLogo) formData.append("removeLogo", "true");
    formData.append("logoAlign", logoAlign);
    if (bannerFile) formData.append("banner", bannerFile);
    if (!bannerPreview && !bannerFile) formData.append("removeBanner", "true");
    formData.append("borderColor", borderColor);
    formData.append("borderWidth", borderWidth);
    formData.append("borderStyle", borderStyle);
    formData.append("borderRadius", borderRadius);
    formData.append("cardShadow", cardShadow);
    formData.append("btnColor", btnColorEnabled ? btnColor : "");

    try {
      if (isNew) {
        await api.post("/forms", formData);
      } else {
        await api.patch(`/forms/${identifier}`, formData);
      }
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.error || "Save failed");
    }
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
      <form onSubmit={handleSubmit(handleSave)}>
        <div style={styles.toolbar}>
          <button
            type="button"
            style={styles.backBtn}
            onClick={() => navigate("/")}
          >
            &larr; Back
          </button>
          <h1 style={styles.heading}>{isNew ? "New Form" : "Edit Form"}</h1>
        </div>

        <div style={styles.settingsGrid}>
          {/* Left: Form Settings */}
          <div style={styles.settingsSection}>
            <h2 style={styles.sectionHeading}>Form Settings</h2>

            <div style={styles.field}>
              <label style={styles.label}>
                Form Name <span style={styles.required}>*</span>
              </label>
              <input
                style={styles.input}
                placeholder="Enter form name..."
                {...register("title")}
              />
              {errors.title && (
                <p style={styles.fieldError}>{errors.title.message}</p>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Form Type</label>
              <select style={styles.input} {...register("formType")}>
                {FORM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Form Status</label>
              <select style={styles.input} {...register("formStatus")}>
                <option value="live">Live</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {formType === "Leads Signup" && (
              <div style={styles.field}>
                <label style={styles.label}>
                  Venue Name <span style={styles.required}>*</span>
                </label>
                <input
                  style={styles.input}
                  placeholder="Enter venue name..."
                  {...register("venueName")}
                />
                {errors.venueName && (
                  <p style={styles.fieldError}>{errors.venueName.message}</p>
                )}
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>
                Source Group <span style={styles.required}>*</span>
              </label>
              <input
                style={styles.input}
                placeholder="e.g. Social Media"
                {...register("sourceGroup")}
              />
              {errors.sourceGroup && (
                <p style={styles.fieldError}>{errors.sourceGroup.message}</p>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Source Name <span style={styles.required}>*</span>
              </label>
              <input
                style={styles.input}
                placeholder="e.g. Facebook Campaign"
                {...register("sourceName")}
              />
              {errors.sourceName && (
                <p style={styles.fieldError}>{errors.sourceName.message}</p>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Assign New Leads To</label>
              <input
                style={styles.input}
                placeholder="Name or email..."
                {...register("assignLeadsTo")}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Redirect Link After Submission</label>
              <input
                style={styles.input}
                placeholder="https://..."
                {...register("redirectLink")}
              />
              {errors.redirectLink && (
                <p style={styles.fieldError}>{errors.redirectLink.message}</p>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Send a Copy of Submissions To</label>
              <input
                style={styles.input}
                placeholder="email@example.com"
                {...register("submissionCopyTo")}
              />
              {errors.submissionCopyTo && (
                <p style={styles.fieldError}>
                  {errors.submissionCopyTo.message}
                </p>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Submission Success Message</label>
              <textarea
                style={{
                  ...styles.input,
                  resize: "vertical",
                  minHeight: "80px",
                }}
                placeholder="Thank you for your submission!"
                {...register("successMessage")}
              />
            </div>
          </div>

          {/* Right: Design Settings */}
          <div style={styles.settingsSection}>
            <h2 style={styles.sectionHeading}>Design</h2>

            <div style={styles.field}>
              <label style={styles.label}>Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setLogoFile(file);
                  setLogoPreview(URL.createObjectURL(file));
                  setRemoveLogo(false);
                }}
              />
              {logoPreview && (
                <div style={styles.previewRow}>
                  <img
                    src={logoPreview}
                    alt="logo preview"
                    style={styles.logoPreview}
                  />
                  <button
                    style={styles.clearBtn}
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                      setRemoveLogo(true);
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
              <div style={styles.alignRow}>
                {["left", "center", "right"].map((a) => (
                  <button
                    key={a}
                    style={{
                      ...styles.alignBtn,
                      ...(logoAlign === a ? styles.alignBtnActive : {}),
                    }}
                    onClick={() => setLogoAlign(a)}
                  >
                    {a === "left"
                      ? "Left"
                      : a === "center"
                        ? "Centre"
                        : "Right"}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Banner Image{" "}
                <span style={styles.hint}>(full-width, top of card)</span>
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
                <div style={styles.previewRow}>
                  <img
                    src={bannerPreview}
                    alt="banner preview"
                    style={styles.bannerPreview}
                  />
                  <button
                    style={styles.clearBtn}
                    onClick={() => {
                      setBannerFile(null);
                      setBannerPreview(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Background Colour</label>
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
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setBgImageFile(file);
                      setBgImagePreview(URL.createObjectURL(file));
                    }}
                  />
                  {bgImagePreview && (
                    <div style={styles.previewRow}>
                      <div style={{ ...styles.bgPreview, ...bgPreviewStyle }} />
                      <button
                        style={styles.clearBtn}
                        onClick={() => {
                          setBgImageFile(null);
                          setBgImagePreview(null);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Submit Button Colour</label>
              <label style={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={btnColorEnabled}
                  onChange={(e) => setBtnColorEnabled(e.target.checked)}
                />
                <span style={{ fontSize: "0.875rem" }}>
                  Custom button colour
                </span>
              </label>
              {btnColorEnabled && (
                <div style={styles.colorRow}>
                  <input
                    type="color"
                    value={btnColor}
                    onChange={(e) => setBtnColor(e.target.value)}
                    style={styles.colorPicker}
                  />
                  <span style={styles.colorHex}>{btnColor}</span>
                </div>
              )}
              <span style={styles.hint}>
                Overrides the default blue on the form's submit button.
              </span>
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
        </div>

        <div style={styles.builderWrap}>
          <div ref={builderRef} />
        </div>

        <div style={styles.saveRow}>
          {serverError && (
            <p style={{ ...styles.error, margin: 0 }}>{serverError}</p>
          )}
          <button type="submit" style={styles.saveBtn}>
            Save Form
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page: { maxWidth: "1400px", margin: "0 auto", padding: "1.5rem" },
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
  settingsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  settingsSection: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  sectionHeading: {
    fontSize: "1rem",
    fontWeight: 700,
    margin: "0 0 0.25rem 0",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid #f0f0f0",
    color: "#111827",
  },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontWeight: 600, fontSize: "0.875rem", color: "#374151" },
  required: { color: "#dc2626", marginLeft: "2px" },
  hint: { fontWeight: 400, color: "#9ca3af", fontSize: "0.8rem" },
  input: {
    padding: "0.5rem 0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "0.9375rem",
    width: "100%",
    boxSizing: "border-box",
  },
  logoPreview: {
    width: "64px",
    height: "64px",
    objectFit: "contain",
    borderRadius: "4px",
    border: "1px solid #eee",
  },
  bannerPreview: {
    width: "100%",
    maxWidth: "320px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "4px",
    border: "1px solid #eee",
  },
  previewRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "0.25rem",
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
  bgPreview: {
    width: "80px",
    height: "50px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  clearBtn: {
    padding: "0.25rem 0.6rem",
    background: "none",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    color: "#dc2626",
    whiteSpace: "nowrap",
  },
  error: { color: "#dc2626", marginBottom: "1rem", fontWeight: 500 },
  fieldError: { color: "#dc2626", fontSize: "0.8rem", margin: "0.2rem 0 0 0" },
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
  alignRow: { display: "flex", gap: "0.4rem", marginTop: "0.25rem" },
  alignBtn: {
    padding: "0.25rem 0.6rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    background: "#f9fafb",
    fontSize: "0.75rem",
    color: "#374151",
  },
  alignBtnActive: {
    background: "#e0e7ff",
    borderColor: "#6366f1",
    color: "#4f46e5",
    fontWeight: 600,
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
  saveRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "1rem",
    marginTop: "1.5rem",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
  builderWrap: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "1rem",
  },
};
