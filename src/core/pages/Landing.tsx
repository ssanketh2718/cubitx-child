import './Landing.css';

/**
 * Public CubitX landing page.
 *
 * The standalone HTML keeps marketing styles and interactions
 * isolated from the authenticated React application.
 *
 * Existing router and authentication are intentionally untouched.
 */
export default function Landing() {
  return (
    <main className="cubitx-landing-shell">
      <iframe
        className="cubitx-landing-frame"
        src="/cubitx-landing.html"
        title="CubitX — Develop the Mind Behind the Marks"
        loading="eager"
        allow="clipboard-write"
      />
    </main>
  );
}