# GidaLink — Your Campus. Your Home.

A student-first Nigerian housing platform MVP. Built with Next.js 16 (App Router, TypeScript), MongoDB, Cloudinary, and Paystack — all backend logic lives in `app/api`, all UI lives in `app`/`components`.

## Tech Stack

- **Framework:** Next.js 16.2.9 (App Router, TypeScript, Turbopack)
- **Database:** MongoDB (via Mongoose)
- **File Storage:** Cloudinary
- **Payments:** Paystack
- **Auth:** Custom JWT (via `jose`, httpOnly cookies)
- **Email:** Nodemailer (Gmail SMTP)
- **Maps:** Pure Leaflet + OpenStreetMap (free, no API key — flies to the selected university automatically)
- **Real-time messaging:** Simple polling (every 3 seconds) — no Socket.io, works on Vercel serverless
- **Styling:** Tailwind CSS v4

## What's New in This Version (Student/Hostel Pivot)

- **Student-first focus:** university selector, distance-from-campus, room type, gender policy, student amenities on every listing
- **Anonymous posting:** any listing, review, or roommate post can be made anonymously (shows "Anonymous" + a generated avatar). Listing owners can flip anonymity on/off anytime from the listing page.
- **No-login reviews & roommate posts:** reviews and roommate requests work without an account, deduplicated by a persistent browser device ID (`lib/deviceId.ts`) instead of requiring login.
- **Roommate Board:** a separate section (`/roommates`) where students post what they're looking for, optionally attaching full apartment details (condition, water, power, etc.) if they already have a place.
- **Map auto-fly:** picking a university on the listing form or browse page flies the Leaflet map to that campus's coordinates (`lib/utils.ts` → `UNIVERSITY_COORDINATES`).
- **Admin visibility:** admins can always see the real account behind an anonymous listing or roommate post for moderation — this is never exposed to regular users.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   cp .env.example .env
   ```

   You'll need:
   - **MongoDB URI** — from MongoDB Atlas (free tier works)
   - **JWT_SECRET** — any long random string
   - **Cloudinary** — cloud name, API key, API secret from cloudinary.com
   - **EMAIL_USER / EMAIL_PASS** — a Gmail address + an app password (not your regular Gmail password) — generate one at myaccount.google.com/apppasswords
   - **Paystack keys** — secret key and public key from your Paystack dashboard
   - **ADMIN_SECRET_CODE** — any string you choose; used to gate the secret admin signup route

3. Run the dev server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   npm start
   ```

## Creating the First Admin Account

Visit `/admin-register` and create an admin account using the `ADMIN_SECRET_CODE` you set in `.env`.

**Important:** This route (`/admin-register` and its backing API route at `/api/auth/admin-secret-x9k2m7`) should be deleted from the codebase before going live, as agreed. Once you have your admin account, delete:
- `app/admin-register/page.tsx`
- `app/api/auth/admin-secret-x9k2m7/route.ts`

## Replacing Placeholder Images

The homepage currently uses temporary Unsplash stock photo URLs. See `public/images/README.txt` for exactly which 4 images to download, what to search for, and where each one is used in `app/page.tsx`.

## Project Structure

```
app/
  api/          → all backend logic (routes, organized by resource)
  (pages)/      → all UI pages
components/      → reusable UI components
lib/             → db connection, JWT, email, Cloudinary, Paystack helpers, utils, deviceId
models/          → Mongoose schemas (TypeScript)
types/           → shared TypeScript interfaces used across frontend + backend
middleware.ts    → route protection for /dashboard and /admin
```

## Notable Implementation Details

- **Platform fee:** 10% is automatically deducted from every successful rent payment.
- **Premium boost pricing:** ₦2,500 (7 days), ₦4,500 (14 days), ₦9,000 (30 days) — these are still placeholder values flagged for your review, adjustable in `app/api/listings/[id]/boost/route.ts`.
- **Messaging:** uses simple polling (3-second interval), not WebSockets — keeps it fully compatible with Vercel's serverless functions.
- **Anonymous identity:** `isAnonymous` is a per-listing flag the owner can toggle anytime via `PUT /api/listings/[id]/anonymity`. Reviews and roommate posts capture `isAnonymous` once at creation.
- **Review/roommate deduplication without login:** a persistent UUID is generated client-side on first visit and stored in `localStorage` (`lib/deviceId.ts`). One review per device per listing is enforced server-side via a unique Mongo index on `(listing, deviceId)`.
- **Moderation:** a listing is automatically flagged for admin review after 3 reports.
- **Map:** built directly on the Leaflet JS library (not react-leaflet) for full control over the fly-to behavior when a university is selected — see `components/listings/MapView.tsx`.

## Known Lint Notes (does not affect the build)

Next.js 16 ships a stricter experimental React Compiler ESLint rule (`react-hooks/set-state-in-effect`) that flags the standard "fetch data inside `useEffect`" pattern used throughout this app's client components. This is a very common, well-established React pattern and not a bug — `npm run build` completes successfully with no errors. If your team later wants to adopt the newer Suspense/`use()`-based data-fetching style instead, that would be a deliberate architecture decision for a future iteration, not something this build silently changed.

## Deploying to Vercel

This project is designed to deploy directly to Vercel with zero modification:
1. Push this code to a GitHub repo
2. Import the repo in Vercel
3. Add all the environment variables from `.env` into the Vercel project settings
4. Deploy

No server processes, no Socket.io, no background workers — everything runs within Vercel's serverless function model.
