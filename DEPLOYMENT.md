# 🚢 Deployment Guide — Vercel

This project needs **zero external services** (no database, no storage
bucket, no API keys) to deploy. Everything it needs ships in the repo.

---

## Option A — Deploy from GitHub (recommended)

### 1. Prepare your content
Before deploying, do the two things described in the README:

1. Replace `public/certificate-template.png` with your certificate image.
2. Edit `data/participants.json` with your approved names.
3. (Optional but recommended) Use `/admin` locally (`npm run dev`) to
   position the name field, then paste the exported config into
   `config/certificate-config.json`.

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: certificate portal"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 3. Import into Vercel

1. Go to **https://vercel.com/new**
2. Select **Import Git Repository** and choose the repo you just pushed
3. Vercel auto-detects Next.js — leave the default build settings:
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
4. Under **Environment Variables**, add:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` (update after you know your final domain) |
   | `ADMIN_USERNAME` | a username of your choice *(optional, recommended)* |
   | `ADMIN_PASSWORD` | a strong password *(optional, recommended)* |
5. Click **Deploy**.

Vercel will install dependencies, run `next build` (which also fetches the
Google Fonts used in the UI — this requires the standard internet access
Vercel's build environment already has), and deploy. You'll get a live URL
in about a minute.

### 4. Verify

- Visit `/` and test a name from your `participants.json`
- Visit `/admin` and confirm it prompts for Basic Auth if you set the env vars
- Try downloading a certificate and confirm the PDF opens correctly

---

## Option B — Deploy with the Vercel CLI

```bash
npm install -g vercel
vercel login
vercel            # first deploy — follow the prompts
vercel --prod      # promote to production
```

Set environment variables via:

```bash
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add ADMIN_USERNAME production
vercel env add ADMIN_PASSWORD production
```

---

## Updating participants or the template after deploying

Because everything is file-based, updates are just a commit + redeploy:

```bash
# edit data/participants.json and/or public/certificate-template.png
# and/or config/certificate-config.json
git add .
git commit -m "Update participant list"
git push
```

Vercel automatically redeploys on every push to your connected branch (if
you used Option A). With the CLI, run `vercel --prod` again.

---

## Custom domain

In your Vercel project → **Settings → Domains**, add your domain and follow
the DNS instructions Vercel provides. Afterwards, update the
`NEXT_PUBLIC_SITE_URL` environment variable to match, then redeploy so SEO
metadata and the sitemap use the correct URL.

---

## Production checklist

- [ ] `public/certificate-template.png` is your real template (not the placeholder)
- [ ] `data/participants.json` contains your real approved names
- [ ] `config/certificate-config.json` positions the name correctly (test with
      a long name and a short name)
- [ ] `ADMIN_USERNAME` / `ADMIN_PASSWORD` are set if `/admin` shouldn't be
      publicly editable-by-view
- [ ] `NEXT_PUBLIC_SITE_URL` matches your final domain
- [ ] You've test-downloaded a certificate PDF and opened it

---

## Troubleshooting

**Build fails fetching fonts locally, but works on Vercel.**
`next/font/google` fetches font files from Google at *build time*. If your
local machine/sandbox has restricted internet access, `next build` may fail
there — this is expected and does **not** affect Vercel, whose build
environment has full internet access.

**"Certificate not found" for a name that's in `participants.json`.**
Check for typos, and remember the JSON file is only re-read on
build/redeploy (or dev server restart) — commit and redeploy after editing it.

**Certificate text is positioned wrong after changing the template image.**
Position values are percentage-based specifically so this shouldn't happen —
but if you cropped or resized your new template differently than the one
used in `/admin` when you set the position, re-open `/admin`, re-upload the
new template, and re-position.

**429 "Too many attempts" during testing.**
That's the built-in rate limiter (15 requests/minute/IP) — wait a minute, or
temporarily raise the limit in `app/api/verify/route.ts`.
