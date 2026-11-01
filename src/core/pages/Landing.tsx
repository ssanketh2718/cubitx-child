import './Landing.css';

/**
 * Public CubitX landing page.
 * The standalone landing page is served from /cubitx-landing.html.
 * Its styles and interactive demonstrations remain isolated from
 * the existing React application.
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