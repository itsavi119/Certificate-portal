# 🎓 Certificate Portal

A production-ready certificate distribution website. Approved participants enter
their name, the system verifies it against an approved list, and — if matched —
dynamically stamps their name onto a certificate template and lets them download
a print-quality PDF.

Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind
CSS**, **shadcn-style UI**, **Framer Motion**, **React Hook Form + Zod**, the
**HTML Canvas API**, and **jsPDF** — no database required.

---

## ✨ Features

- **Name verification** — case-insensitive, whitespace-normalized matching against
  an approved participant list (`"  Avi   Sharma "` = `"AVI SHARMA"` = `"avi sharma"`)
- **Dynamic certificate rendering** — the participant's name is drawn onto your
  template image at full resolution using the Canvas API, with auto-shrink and
  line-wrapping for long names
- **Print-quality PDF export** — single-page A4 PDF (landscape or portrait),
  scaled to fit without cropping or distortion, named `certificate-[name].pdf`
- **Visual admin configurator** (`/admin`) — upload a template, click to position
  the name, tune font/size/color/alignment live, then export the config
- **Zero database** — participants live in a plain JSON file you edit directly
- **Security** — input sanitization, Zod validation, rate limiting, security
  headers, optional Basic Auth on `/admin`
- **Accessible & responsive** — keyboard navigable, ARIA labels, visible focus
  states, mobile/tablet/desktop layouts
- **SEO-ready** — metadata, Open Graph/Twitter cards, sitemap, robots.txt

---

## 🗂 Project structure

```
certificate-portal/
├── app/
│   ├── page.tsx                 # Public homepage (name lookup)
│   ├── layout.tsx                # Root layout, fonts, SEO metadata
│   ├── globals.css               # Design tokens, glassmorphism utilities
│   ├── admin/page.tsx            # Admin configurator route
│   ├── api/verify/route.ts       # POST /api/verify — validates a name
│   ├── sitemap.ts / robots.ts    # SEO
├── components/
│   ├── certificate-form.tsx      # Name input + verification flow
│   ├── certificate-preview.tsx   # Canvas preview, zoom, PDF download
│   ├── admin-configurator.tsx    # Visual template/position/style editor
│   ├── seal-stamp.tsx            # Success "seal" animation
│   └── ui/                       # Button, Input, Card, Alert, Select, etc.
├── lib/
│   ├── participants.ts           # Name normalization + lookup
│   ├── validation.ts             # Zod schemas
│   ├── rate-limit.ts             # In-memory rate limiter
│   ├── utils.ts                  # cn(), slugifyName()
│   └── certificate/
│       ├── types.ts              # CertificateConfig types
│       ├── render.ts             # Canvas rendering + auto-fit logic
│       └── pdf.ts                # jsPDF export logic
├── config/certificate-config.json  # ⚙️ Name position/font/color config
├── data/participants.json          # ⚙️ Approved participant names
├── public/certificate-template.png # ⚙️ Your certificate template image
├── middleware.ts                  # Security headers + /admin Basic Auth
└── DEPLOYMENT.md                  # Vercel deployment guide
```

The three files marked ⚙️ are the ones you'll edit to make this **your** portal.

---

## 🚀 Quick start

**Requirements:** Node.js 18.18+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template
cp .env.example .env.local
# (edit .env.local — see "Environment variables" below)

# 3. Run the dev server
npm run dev
```

Open **http://localhost:3000** for the public portal, and
**http://localhost:3000/admin** for the configurator.

Try it immediately with the bundled example data: the sample
`data/participants.json` includes `"Avi Sharma"`, `"Rahul Patel"`, `"Priya Shah"`,
`"John Doe"`, `"Sneha Verma"`, and `"Arjun Mehta"` — enter any of those names
(in any case, with any extra spacing) to see a working certificate generated
from the included placeholder template.

---

## 1️⃣ Add your certificate template

1. Export your certificate design as a **PNG or JPG**, ideally at **A4
   resolution and 300 DPI** for crisp printing:
   - Landscape: **3507 × 2481 px**
   - Portrait: **2481 × 3507 px**
2. Leave the area where the name should go **visually empty** — the app draws
   the name on top of your image, it doesn't replace anything in the image
   itself.
3. Save the file as `public/certificate-template.png` (replacing the included
   placeholder), or as a `.jpg`/`.jpeg` — just make sure the filename matches
   `imagePath` in `config/certificate-config.json`.

## 2️⃣ Add your approved participants

Edit `data/participants.json` — a plain JSON array of full names:

```json
[
  "Avi Sharma",
  "Rahul Patel",
  "Priya Shah",
  "John Doe"
]
```

That's it. Matching is automatically case-insensitive and ignores leading,
trailing, and duplicate spaces — you don't need to worry about formatting
consistency. Save the file and restart the dev server (or redeploy) to pick
up changes.

## 3️⃣ Position the name on your template

The easiest way is the **visual configurator** at `/admin`:

1. Click **"Upload template (PNG/JPG)"** and select your certificate image
   (this is a *preview-only* upload — see the note below).
2. **Click anywhere on the preview** to move the name there, or use the
   position sliders for pixel-perfect control.
3. Adjust font family, size, weight, color, alignment, and max width. Try the
   sample long-name buttons to confirm long names shrink/wrap gracefully.
4. Click **"Copy JSON"** or **"Download certificate-config.json"**.
5. Paste/replace the contents of `config/certificate-config.json` in your
   project with the exported config.
6. If you uploaded a new template image in step 1, also click **"Save as
   certificate-template"** to download it, then move that file into
   `public/certificate-template.png`.
7. Commit both files and redeploy.

> **Why isn't the upload saved automatically?** Vercel's serverless functions
> run on a read-only, ephemeral filesystem — there's nowhere durable to save
> an uploaded file without adding a database or object-storage service, which
> this project intentionally avoids. The configurator instead lets you *design
> visually* and *export the result* to commit into your repo, which keeps the
> project 100% static-JSON-driven as required, at the small cost of one
> extra copy/paste + redeploy step whenever you change the template.

By default, `/admin` is **open to anyone with the URL**. Set `ADMIN_USERNAME`
and `ADMIN_PASSWORD` (see below) before deploying publicly if you don't want
that.

---

## ⚙️ `certificate-config.json` reference

```jsonc
{
  "imagePath": "/certificate-template.png",   // path under /public
  "orientation": "landscape",                  // "landscape" | "portrait"
  "name": {
    "xPercent": 50,          // horizontal anchor, % of image width (0-100)
    "yPercent": 30.5,        // vertical anchor, % of image height (0-100)
    "fontFamily": "Georgia, 'Times New Roman', serif",
    "fontSize": 46,          // px, authored against a 1000px-wide reference
    "fontWeight": "semibold",// "normal" | "medium" | "semibold" | "bold"
    "color": "#17345C",
    "align": "center",       // "left" | "center" | "right"
    "maxWidthPercent": 70,   // shrink/wrap threshold, % of image width
    "minFontSize": 20,       // won't shrink smaller than this
    "autoFit": true,         // auto-shrink long names to fit maxWidthPercent
    "lineHeight": 1.15       // multiplier, used if a name wraps to 2 lines
  }
}
```

All position/size values are **percentage or reference-relative**, so the
layout stays correct no matter what resolution your template image is.

---

## 🔐 Environment variables

Copy `.env.example` to `.env.local` (for local dev) and configure the same
variables in your Vercel project settings for production:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Recommended | Used for SEO metadata, Open Graph tags, and the sitemap |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Optional | If **both** are set, `/admin` requires HTTP Basic Auth |

---

## 🔒 Security

- **Input sanitization & validation** — Zod enforces a 2–100 character length
  and an allow-list pattern (letters, spaces, hyphens, apostrophes, periods)
  on every name, rejecting HTML/script-injection attempts by construction
- **Rate limiting** — 15 verification attempts per minute per IP (in-memory
  sliding window, see `lib/rate-limit.ts`)
- **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, and a `Content-Security-Policy`
  applied to every response (`next.config.ts`)
- **No client-supplied HTML is ever rendered** — the name is drawn via the
  Canvas API (`fillText`), never injected into the DOM as HTML, which rules
  out DOM-based XSS from the name field entirely
- **Optional Basic Auth** on `/admin` via `ADMIN_USERNAME`/`ADMIN_PASSWORD`
- **`/admin` and `/api` excluded from search indexing** via `robots.ts`

**Note on rate limiting at scale:** the limiter is in-memory, so it's "best
effort" across Vercel's distributed serverless instances rather than a
globally strict guarantee under heavy concurrent load. For most certificate
distribution use cases (a known, finite audience) this is more than
sufficient. If you need hard guarantees at high scale, swap
`lib/rate-limit.ts` for Vercel KV or Upstash Redis — no other file needs to
change.

---

## ♿ Accessibility

- Semantic HTML, labeled form fields, and `aria-describedby` error wiring
- Visible keyboard focus rings (`focus-ring` utility) throughout
- `aria-live="polite"` on the certificate preview region so screen readers
  announce state changes
- Color palette chosen to meet WCAG AA contrast for body text
- Respects `prefers-reduced-motion` (disables/shortens animations)

---

## 🎨 Customization

- **Colors** — edit the CSS custom properties in `app/globals.css` (`:root`)
  and the `primary` scale in `tailwind.config.ts`
- **Fonts** — the UI uses Fraunces (display) + Inter (body) via
  `next/font/google` in `app/layout.tsx`; certificate text fonts are
  configured separately and independently in `certificate-config.json`
  (kept to web-safe fonts so canvas rendering is consistent across browsers
  without extra font-loading)
- **Copy** — homepage headline/subtitle live in `app/page.tsx`

---

## 🧪 Scripts

```bash
npm run dev        # start local dev server
npm run build       # production build
npm run start       # run the production build locally
npm run lint         # ESLint
npm run typecheck    # TypeScript, no emit
```

---

## 🚢 Deploying

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for a full, step-by-step Vercel
deployment guide.

---

## 📄 License

This project is provided as-is for you to adapt and deploy for your own
certificate distribution needs.
