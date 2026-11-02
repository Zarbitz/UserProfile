# ZARBITZ UserProfile — work in progress

Initial Node.js/PostgreSQL backend scaffold for centralized Google/Apple OAuth, email and phone OTP, profiles, asset ownership, dataset access, enquiries and report requests.

**Not ready for production deployment.** This commit preserves development progress for continuation on the Mac Mini. No live authentication providers or database have been configured or verified.

## Current scope

- Better Auth configuration with PostgreSQL, email OTP through SMTP and phone OTP through Twilio Programmable Messaging (not Twilio Verify).
- Immediate profile activation after a successful login; per-user asset queries.
- Point/polygon geometry validation, administrator dataset assignment and authenticated Zarr file access.
- Persistent enquiry records with retried email notifications.
- Report request records only; generation and delivery are not implemented.

## Still required

- Account UI, map drawing, dashboard and administrator UI.
- Integration of Web, Agri, Dams and Building with selected assets and shared authentication.
- Production deployment manifests, complete Mac Mini/Antigravity rulebook, backups and recovery procedures.
- Verified-contact enforcement review, abuse controls, account linking, report generation/notification worker and data pipeline integration.
- Database migrations and authentication/security tests against a running PostgreSQL instance.

## Development prerequisites on the Mac Mini

Use Node.js 22 or newer and PostgreSQL. Install dependencies with `npm ci`. Configure environment variables before running `npm run migrate` or `npm start`.

Required: `DATABASE_URL`, `PUBLIC_URL`, `BETTER_AUTH_SECRET` (random strong secret).
Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, `ENQUIRY_TO` (defaults to zatbitzlabs@gmail.com).
OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET` (Apple JWT expires and must be renewed).
SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`.
Operations: `ADMIN_EMAILS` (comma separated), `ZARR_ROOT`, `PORT` (default 8080).

Secrets belong in the Mac's protected runtime environment, never in Git. The current server expects platform mounts under `/platforms/` and a future account UI in `public/`; these are not included yet. Do not expose this scaffold publicly until the remaining work and security checks are complete.
