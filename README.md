# Ivara Hous

Luxury travel agency website built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, intro, assessment preview, services, networks, CTA |
| `/about` | About Ivara Hous |
| `/services` | All six services |
| `/creator-application` | Creator application form |
| `/partner-with-us` | Partnership inquiry form |
| `/creative-partner-application` | Creative partner form |
| `/creator-development-assessment` | Multi-step assessment + results |
| `/contact` | Contact form |

## Project Structure

```
src/
├── app/                    # Pages & API routes
│   └── api/                # Form submission stubs (ready for integrations)
├── components/
│   ├── assessment/         # Multi-step assessment & results
│   ├── forms/              # Reusable form components
│   ├── home/               # Homepage sections
│   ├── layout/             # Header, Footer, PageHero
│   └── ui/                 # Button, LuxuryImage, etc.
└── lib/
    ├── constants.ts        # Nav, site name
    ├── services.ts         # Service copy (single source of truth)
    ├── assessment.ts       # Assessment steps & scoring
    └── api-response.ts     # API helpers + integration TODOs
```

## Customization

- **Images**: Add or swap files in `public/images/` and update mappings in `src/lib/images.ts`.
- **Copy**: Update `src/lib/services.ts` and section components.
- **Colors & fonts**: `tailwind.config.ts` and `src/app/layout.tsx` (Google Fonts).

## Future Integrations

API routes in `src/app/api/` log submissions and return success responses. Wire up in `src/lib/api-response.ts`:

- **Notion** — store form submissions
- **Email** — Resend / SendGrid notifications
- **Stripe** — $95 Creator Development Plan checkout (button on assessment results)
- **OpenAI** — real assessment scoring

## Build

```bash
npm run build
npm start
```
