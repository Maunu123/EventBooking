# EventBook backend

Node.js 24 or newer is required. Keep `server/.env` private; `.env.example`
shows the supported values without credentials. The backend uses your MongoDB
connection for event listings, saved demo bookings and contact enquiries.
Existing login accounts and sessions remain in `client/server/data/accounts.sqlite`
so the integration does not discard accounts created earlier.

## Run locally

Install dependencies in both `server` and `client` with `npm.cmd install`.
From `client`, run `npm.cmd run dev` and open http://localhost:5173.
Vite mounts the Express app directly, so a second process is not required.
Restart Vite after editing backend files loaded through CommonJS.

To run the API separately, run `npm.cmd start` from `server` (default port 5000).
The API starts even if MongoDB is unavailable; health reports HTTP 503, while
account access remains available. Listing fallback is explicitly labelled.
Database writes never return success when MongoDB is unavailable.

## Implemented

- Existing salted-password, cookie-session login with buyer/organizer roles.
- Public event catalogue with the original sample events plus MongoDB listings.
- Organizer-only event creation, future-date and price validation, own-event list.
- Saved demo bookings, server-calculated amounts, idempotent retries and private history.
- Persisted contact enquiries with confirmation references (no email sent).
- Origin checks, request-size limits, basic local rate limiting and safe error messages.

## API

| Method | Path | Access |
| --- | --- | --- |
| GET | /api/health | Public |
| GET | /api/events | Public |
| POST | /api/events | Organizer |
| GET | /api/organizer/events | Organizer; own listings only |
| POST | /api/bookings/demo | Signed in |
| GET | /api/bookings | Signed in; own bookings only |
| POST | /api/contact | Public |
| GET | /api/auth/me | Current session |
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/auth/logout | Current session |

## Verification

- `npm.cmd test` in `server`: API behavior using an isolated in-memory test repository.
- `npm.cmd run test:integration` in `server`: actual MongoDB round trip. Creates a
  uniquely named `eventbook_verification_...` database, checks persistence, then
  drops only that isolated database. Requires MongoDB permissions for that database.
- `npm.cmd run test:auth`, `npm.cmd run build`, `npm.cmd run lint` in `client`.

## Before public launch

1. Choose a payment provider and configure its server-only credentials and signed
   webhook verification. Payment completion must be established server-side.
2. Add inventory reservation/expiry, sold-out checks under concurrent purchases,
   refunds/cancellations and ticket issuance/check-in. Demo bookings reserve no stock.
3. Add transactional email, verified email addresses and password recovery.
4. Add event editing/cancellation, organizer sales reporting, an authorized staff
   enquiry inbox and moderation. Do not grant organizer accounts access to all enquiries.
5. Replace sample event data, illustrative pricing and promotional claims with
   approved content; finalize terms, privacy, refund policy and support contacts.
6. Deploy behind HTTPS with a same-origin /api proxy, set APP_ORIGIN and
   NODE_ENV=production, use persistent storage for MongoDB and SQLite, configure
   backups, deployment-aware rate limiting and monitoring. Vite is only for local use.

There is no production payment gateway or actual admission ticket issuance yet.
