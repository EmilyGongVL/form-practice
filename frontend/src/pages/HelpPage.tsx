export default function HelpPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <p style={s.navTitle}>Help</p>
        <a style={s.navLink} href="#sidebar">Sidebar Components</a>
        <a style={s.navSub} href="#basic">Basic</a>
        <a style={s.navSub} href="#advanced">Advanced</a>
        <a style={s.navSub} href="#layout">Layout</a>
        <a style={s.navSub} href="#data">Data</a>
        <a style={s.navLink} href="#display-tab">Display Tab</a>
        <a style={s.navLink} href="#validation-tab">Validation Tab</a>
        <a style={s.navLink} href="#data-tab">Data Tab</a>
        <a style={s.navLink} href="#api-tab">API Tab</a>
        <a style={s.navLink} href="#conditional-tab">Conditional Tab</a>
        <a style={s.navLink} href="#logic-tab">Logic Tab</a>
        <a style={s.navLink} href="#layout-tab">Layout Tab</a>
      </nav>

      <main style={s.main}>
        <h1 style={s.h1}>Form Builder Reference</h1>
        <p style={s.intro}>A guide to every component and setting available in the form builder.</p>

        {/* ── SIDEBAR COMPONENTS ── */}
        <section id="sidebar">
          <h2 style={s.h2}>Sidebar Components</h2>
          <p style={s.p}>Drag any component from the left panel onto the canvas to add it to your form.</p>

          <h3 id="basic" style={s.h3}>Basic</h3>
          <p style={s.p}>The everyday inputs most forms need.</p>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Component</th><th style={s.th}>What it does</th></tr></thead>
            <tbody>
              {[
                ['Text Field', 'Single-line text input — names, cities, short answers.'],
                ['Text Area', 'Multi-line text input — comments, messages, longer answers.'],
                ['Number', 'Accepts numbers only. Supports min/max validation.'],
                ['Password', 'Text input that masks characters as the user types.'],
                ['Checkbox', 'A single tick box — stores true or false.'],
                ['Select Boxes', 'A group of checkboxes — user can tick multiple options.'],
                ['Select', 'A dropdown list — user picks exactly one option.'],
                ['Radio', 'Radio buttons displayed side-by-side — user picks one from a visible list.'],
                ['Email', 'Text input with built-in email format validation.'],
                ['URL', 'Text input that validates a web address.'],
                ['Phone Number', 'Text input formatted for phone numbers.'],
                ['Tags', 'Free-type keywords or tags, stored as an array.'],
                ['Address', 'Address autocomplete powered by Google Maps API.'],
                ['Date / Time', 'Combined date and time picker.'],
                ['Day', 'Three separate dropdowns: Day, Month, Year.'],
                ['Time', 'Time-only picker (hours and minutes).'],
                ['Currency', 'Number input formatted as a monetary value.'],
                ['Survey', 'A grid of questions with rating columns — like a Likert scale.'],
                ['Signature', 'A touch or mouse signature pad.'],
              ].map(([name, desc]) => (
                <tr key={name}><td style={s.td}><strong>{name}</strong></td><td style={s.td}>{desc}</td></tr>
              ))}
            </tbody>
          </table>

          <h3 id="advanced" style={s.h3}>Advanced</h3>
          <p style={s.p}>Less common inputs with richer behaviour.</p>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Component</th><th style={s.th}>What it does</th></tr></thead>
            <tbody>
              {[
                ['HTML Element', 'Renders any raw HTML you write — headings, images, divs, etc.'],
                ['Content', 'A block of rich formatted text. Not an input — purely for display.'],
                ['Button', 'Submit the form or trigger a custom action.'],
              ].map(([name, desc]) => (
                <tr key={name}><td style={s.td}><strong>{name}</strong></td><td style={s.td}>{desc}</td></tr>
              ))}
            </tbody>
          </table>

          <h3 id="layout" style={s.h3}>Layout</h3>
          <p style={s.p}>Not inputs — used to organise and structure the form visually.</p>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Component</th><th style={s.th}>What it does</th></tr></thead>
            <tbody>
              {[
                ['Columns', 'Splits the row into side-by-side columns so you can place fields next to each other.'],
                ['Field Set', 'Groups related fields inside a labelled border box.'],
                ['Panel', 'A collapsible card section with a title — good for long forms.'],
                ['Table', 'Arranges fields in a fixed table grid.'],
                ['Tabs', 'Puts groups of fields into tabbed sections.'],
                ['Well', 'A shaded box to visually group fields — no label or border.'],
              ].map(([name, desc]) => (
                <tr key={name}><td style={s.td}><strong>{name}</strong></td><td style={s.td}>{desc}</td></tr>
              ))}
            </tbody>
          </table>

          <h3 id="data" style={s.h3}>Data</h3>
          <p style={s.p}>For dynamic, repeating, or hidden data.</p>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Component</th><th style={s.th}>What it does</th></tr></thead>
            <tbody>
              {[
                ['Hidden', 'An invisible field. Stores a value in the submission without showing it to the user.'],
                ['Container', 'Groups fields under a nested JSON key (e.g. address.street instead of street).'],
                ['Data Map', 'Key-value pairs the user can add and remove dynamically.'],
                ['Data Grid', 'A repeating group of fields — user can add or remove rows (e.g. list of work experiences).'],
                ['Edit Grid', 'Like Data Grid but each row opens as a modal dialog to edit.'],
                ['Tree', 'A hierarchical nested data structure with parent-child relationships.'],
              ].map(([name, desc]) => (
                <tr key={name}><td style={s.td}><strong>{name}</strong></td><td style={s.td}>{desc}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <hr style={s.hr} />

        {/* ── DISPLAY TAB ── */}
        <section id="display-tab">
          <h2 style={s.h2}>Display Tab</h2>
          <p style={s.p}>Controls how the component looks and feels to the person filling in the form.</p>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Field</th><th style={s.th}>What it does</th></tr></thead>
            <tbody>
              {[
                ['Label', 'The visible name shown above or beside the input. This is what users read to understand what to fill in.'],
                ['Label Position', 'Where the label sits relative to the input: Top (default), Left, Right, or hidden (no label shown).'],
                ['Placeholder', 'Grey hint text that appears inside the empty input field. Disappears as soon as the user starts typing.'],
                ['Description', 'Helper text shown below the input. Use it to give extra instructions or context.'],
                ['Tooltip', 'Text shown in a small popup when the user hovers or clicks the ⓘ icon next to the label. Good for optional detail that would clutter the main label.'],
                ['Input Mask', 'Forces a specific typing format. E.g. (999) 999-9999 ensures phone numbers are formatted correctly as typed.'],
                ['Custom CSS Class', 'Adds one or more CSS class names to the field wrapper element — useful if you want to apply custom styles.'],
                ['Tab Index', 'Sets the keyboard Tab order. 0 means follow the natural document order. Use positive numbers to force a specific sequence.'],
                ['Hidden', 'Hides the field visually on the rendered form, but its value is still included in the submission data.'],
                ['Disabled', 'Shows the field but prevents the user from editing it. The value can still be pre-filled and submitted.'],
                ['Table View', 'Whether the field value appears as a column in Data Grid table views.'],
              ].map(([name, desc]) => (
                <tr key={name}><td style={s.td}><strong>{name}</strong></td><td style={s.td}>{desc}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <hr style={s.hr} />

        {/* ── VALIDATION TAB ── */}
        <section id="validation-tab">
          <h2 style={s.h2}>Validation Tab</h2>
          <p style={s.p}>Controls what values are accepted. Validation runs when the user submits the form.</p>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Field</th><th style={s.th}>What it does</th></tr></thead>
            <tbody>
              {[
                ['Required', 'The field must have a value before the form can be submitted. Shows an error if left empty.'],
                ['Unique', 'The value must not already exist in a previous submission. Requires a server-side check.'],
                ['Minimum Length', 'The fewest characters the user is allowed to enter. Below this count the field shows an error.'],
                ['Maximum Length', 'The most characters allowed. Prevents input beyond this count.'],
                ['Minimum Value', 'The smallest number accepted (number fields only).'],
                ['Maximum Value', 'The largest number accepted (number fields only).'],
                ['Regular Expression', 'A pattern the value must match. E.g. ^[A-Z] requires the value to start with an uppercase letter.'],
                ['Error Label', 'Replaces the field name in error messages. E.g. "Mobile number" instead of "phoneNumber".'],
                ['Custom Error Message', 'Overrides the default "This field is invalid" text with your own wording.'],
                ['Custom Validation', 'A JavaScript expression for complex rules. The variable "input" holds the current value. Return true to pass, or a string to show as an error message.'],
              ].map(([name, desc]) => (
                <tr key={name}><td style={s.td}><strong>{name}</strong></td><td style={s.td}>{desc}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <hr style={s.hr} />

        {/* ── DATA TAB ── */}
        <section id="data-tab">
          <h2 style={s.h2}>Data Tab</h2>
          <p style={s.p}>Controls default values and how data is stored in the submission.</p>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Field</th><th style={s.th}>What it does</th></tr></thead>
            <tbody>
              {[
                ['Default Value', 'The value pre-filled when the form first loads. The user can overwrite it.'],
                ['Multiple Values', 'Allows the field to collect more than one value, stored as an array.'],
                ['Protected', 'Marks the value as sensitive — it is saved but excluded from API read responses.'],
                ['Persistent', 'When off, the field value is not included in the final form submission data.'],
                ['Input Type', 'Changes the underlying HTML input type attribute (e.g. text, tel, search).'],
                ['Table View', 'Whether this field value appears as a column when the submission is viewed in a table.'],
                ['Modal Edit', 'Opens an edit modal when this field is inside a Data Grid or Edit Grid row.'],
              ].map(([name, desc]) => (
                <tr key={name}><td style={s.td}><strong>{name}</strong></td><td style={s.td}>{desc}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <hr style={s.hr} />

        {/* ── API TAB ── */}
        <section id="api-tab">
          <h2 style={s.h2}>API Tab</h2>
          <p style={s.p}>Controls the field's key in the submission JSON and any custom metadata.</p>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Field</th><th style={s.th}>What it does</th></tr></thead>
            <tbody>
              {[
                ['Property Name', 'The unique key used for this field in the JSON submission object (e.g. "firstName"). Must be unique within the form.'],
                ['Custom Properties', 'Arbitrary key-value pairs attached to the component schema — useful for passing metadata to custom code or integrations.'],
                ['Expose to Template', "Makes this field's value available as a variable when rendering other fields' templates or calculated values."],
              ].map(([name, desc]) => (
                <tr key={name}><td style={s.td}><strong>{name}</strong></td><td style={s.td}>{desc}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <hr style={s.hr} />

        {/* ── CONDITIONAL TAB ── */}
        <section id="conditional-tab">
          <h2 style={s.h2}>Conditional Tab</h2>
          <p style={s.p}>Show or hide this field based on the value of another field, without writing code.</p>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Field</th><th style={s.th}>What it does</th></tr></thead>
            <tbody>
              {[
                ['Simple — This component should', 'Choose Show or Hide as the action when the condition is met.'],
                ['Simple — When the form component', 'Pick the other field whose value you want to check.'],
                ['Simple — Has the value', 'The exact value that triggers the show/hide action.'],
                ['Advanced Condition', 'A JavaScript expression for complex rules. Use the "data" object to access any field value (e.g. show = data.country === "AU"). Must return a boolean.'],
              ].map(([name, desc]) => (
                <tr key={name}><td style={s.td}><strong>{name}</strong></td><td style={s.td}>{desc}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <hr style={s.hr} />

        {/* ── LOGIC TAB ── */}
        <section id="logic-tab">
          <h2 style={s.h2}>Logic Tab</h2>
          <p style={s.p}>Trigger actions on this field automatically when conditions are met — for example, changing its value or disabling it based on user input elsewhere.</p>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Field</th><th style={s.th}>What it does</th></tr></thead>
            <tbody>
              {[
                ['Name', 'A label for this logic rule — only used for your reference inside the builder.'],
                ['Trigger — Simple', 'Fires when a chosen field equals a specific value. No code needed.'],
                ['Trigger — Event', 'Fires on a named event emitted by the form (e.g. a custom event dispatched in other logic).'],
                ['Trigger — Javascript', 'Fires when a JavaScript expression returns true. Access field values via the "data" object.'],
                ['Trigger — JSON Logic', 'Fires when a JSON Logic rule evaluates to true — a code-free alternative to JavaScript.'],
                ["Action — Value", "Sets this field's value to a static string or a calculated expression when the trigger fires."],
                ['Action — Property', 'Changes a component property (e.g. disabled, hidden, required) when the trigger fires.'],
                ["Action — Merge Component Schema", "Merges a partial JSON schema into this component's definition, overriding specific settings."],
                ['Action — Custom Action', 'Runs arbitrary JavaScript when the trigger fires. Use "component", "instance", and "value" variables.'],
              ].map(([name, desc]) => (
                <tr key={name}><td style={s.td}><strong>{name}</strong></td><td style={s.td}>{desc}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <hr style={s.hr} />

        {/* ── LAYOUT TAB ── */}
        <section id="layout-tab">
          <h2 style={s.h2}>Layout Tab</h2>
          <p style={s.p}>Controls the Bootstrap grid placement of this field within its row.</p>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Field</th><th style={s.th}>What it does</th></tr></thead>
            <tbody>
              {[
                ['Size', 'Sets the input size class: Small, Medium (default), or Large — affects padding and font size.'],
                ['Width', 'Number of Bootstrap columns this field spans (1–12). 12 = full row width.'],
                ['Offset', 'Empty columns inserted before this field — pushes it to the right without another field filling the gap.'],
                ['Push', 'Moves the field right by the given number of columns using CSS positioning, without affecting the flow of other fields.'],
                ['Pull', 'Moves the field left by the given number of columns using CSS positioning, without affecting the flow of other fields.'],
              ].map(([name, desc]) => (
                <tr key={name}><td style={s.td}><strong>{name}</strong></td><td style={s.td}>{desc}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' },
  nav: { width: '220px', flexShrink: 0, background: '#fff', borderRight: '1px solid #e5e7eb', padding: '2rem 1rem', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  navTitle: { fontWeight: 700, fontSize: '1rem', color: '#111', margin: '0 0 0.75rem' },
  navLink: { display: 'block', padding: '0.35rem 0.5rem', borderRadius: '4px', color: '#4f46e5', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' },
  navSub: { display: 'block', padding: '0.25rem 0.5rem 0.25rem 1.25rem', borderRadius: '4px', color: '#6b7280', textDecoration: 'none', fontSize: '0.825rem' },
  main: { flex: 1, padding: '2.5rem 3rem', maxWidth: '860px' },
  h1: { fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem' },
  intro: { color: '#6b7280', marginBottom: '2rem' },
  h2: { fontSize: '1.3rem', fontWeight: 700, margin: '2rem 0 0.5rem', color: '#111' },
  h3: { fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 0.4rem', color: '#374151' },
  p: { color: '#6b7280', margin: '0 0 0.75rem', fontSize: '0.9rem' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '0.5rem 0.75rem', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' },
  td: { padding: '0.55rem 0.75rem', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top', color: '#374151' },
  hr: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '2rem 0' },
};
