# CubitX Security Constitution

## Scope
CubitX handles children's personal and behavioral data (minors, ages 10–12) and
payment relationships with parents. Every change is judged against this document.

## Non-negotiables

### 1. Secrets
- No secret ever enters the git repo. `.env.local` is gitignored.
- `VITE_` prefixed vars are PUBLIC. Never put a secret in one.
- Supabase secret/service_role key NEVER leaves the Supabase dashboard.
- Any secret leaked to git = rotate immediately, not later.

### 2. Database
- RLS enabled on every table. No exceptions.
- Every policy reviewed line-by-line before merge.
- No `USING (true)` policies ever.
- Service-role queries only from server-side code that we control.
- Destructive ops (DROP, TRUNCATE, DELETE without WHERE) require review.

### 3. Auth
- Email magic link + Google OAuth only. No passwords stored.
- Session tokens handled by Supabase SDK. Never roll our own.
- Sign out clears session + any cached child data.
- Rate limit magic links (Supabase SMTP via Resend).

### 4. Client
- No secret in the client bundle. Period.
- No `dangerouslySetInnerHTML`. All user input rendered as text.
- No `eval`, no `new Function`, no dynamic script injection.
- CSP header strict. `connect-src` limited to Supabase + payments.
- All external links use `rel="noopener noreferrer"`.
- Embedded third-party content (videos, widgets) opens externally — never iframed.

### 5. Payments
- Webhook verification: HMAC signature verified server-side.
- Never trust client-side "payment succeeded" flags.
- Idempotency keys on every payment event.
- Refund path tested before launch.

### 6. Child data
- Minimal collection. First name only, no DOB, no photo, no location.
- No third-party analytics on child-facing pages.
- No ad networks. Ever.
- Parent can delete child + all data from dashboard.
- Data export (JSON) available on request.

### 7. Dependencies
- Run `npm audit` weekly. Fix high/critical within 7 days.
- No packages with <100 weekly downloads unless justified.
- No packages that haven't been updated in 12 months.

### 8. Deployment
- HTTPS only. HSTS preload.
- No preview deployments accessible to public without auth.
- Every PR reviewed for security impact before merge.
- Rollback plan for every deploy.

### 9. Logging
- No child PII in logs.
- No session tokens in logs.
- Errors go to Sentry (or similar), scrubbed of PII.

### 10. Incident response
- If we suspect a breach: revoke all sessions, rotate all keys, notify
  affected parents within 72 hours per DPDP Act requirements.
  