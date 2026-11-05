# Muashir | مؤشر

**An early warning tool for occupational burnout.** Muashir is a bilingual (Arabic and English) web app that helps one person notice burnout early, before it reaches the red zone. It combines the Copenhagen Burnout Inventory with a month-by-month self-rating and a checklist of warning signs.

**Live site:** [muashir-sa.netlify.app](https://muashir-sa.netlify.app)

Built for CPIS393 Workplace Skills (Assignment 4: Occupational Burnout) at King Abdulaziz University.

## Features

- **Self-check.** 13 questions from the Copenhagen Burnout Inventory give two scores from 0 to 100, one personal and one work-related. The next steps adapt to the band and to whether the strain comes mainly from work, from life outside work, or from both.
- **Your months.** The user rates each of the last 6 months. Two months in a row that are worse than the month before trigger an early warning.
- **Warning signs.** 9 signs grouped under the three WHO dimensions of burn-out, each with a practical step. They are kept separate from the score.
- **Bilingual.** Full Arabic (right to left) and English versions, switchable at any time.
- **Accessible.** Keyboard answering (keys 1 to 5, arrow keys), ARIA labels, light and dark themes, and reduced motion when the device asks for it.
- **Private by design.** No backend, no accounts, no tracking and no sample data. Everything the user enters stays in their own browser.

## Tech stack

| Layer | Technology |
| --- | --- |
| Interface | React 19, TypeScript 7 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| State | Zustand 5, persisted to `localStorage` |
| Languages | i18next, 245 strings per language |
| Motion | Framer Motion 14 |
| Fonts | Self-hosted WOFF2 (Noto Sans Arabic and others) |
| Hosting | Netlify |

## Architecture

Muashir is a client-side single-page application. All logic runs in the browser and the production build is a set of static files, so no application server or database is needed. Scoring is deterministic: scores come from fixed formulas and advice is pre-written text selected by rules, so the same answers always give the same result.

The live site is served over HTTPS (TLS 1.3, HSTS) with HTTP/2 and Brotli compression. A rewrite rule in `public/_redirects` sends every route to `index.html`, so deep links such as `/check` work on refresh.

## Run it locally

You need [Node.js](https://nodejs.org) 20.19 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open the address it prints, usually http://localhost:5173.

```bash
npm run build
```

`build` type-checks the project and writes the site to `dist/`.

## Project layout

```
src/
  components/   Logo, Gauge, Embers, Aurora, LanguageSwitch and more
  data/         questions, signs, areas, references
  lib/          scoring, trend rule, formatting
  locales/      en.json, ar.json (all interface text)
  pages/        Overview (home), Check, Trend, Signs, Method
  store/        Zustand store for answers, months, signs and language
```

## How it was built

Muashir was built through an AI-assisted engineering workflow that I led as the project owner. I set the requirements and the product and design decisions, tested each iteration and published the release. AI coding tools (Claude Code, Codex and Gemini) generated the code under that direction.

## Limits

Muashir is for awareness. It is not a medical diagnosis or a replacement for a specialist. The score bands, the two-month warning rule and the 10-point gap are design choices for this project, not validated clinical rules, and the Arabic wording of the questions is not a validated Arabic version of the inventory.

## References

- Kristensen, T. S., Borritz, M., Villadsen, E., & Christensen, K. B. (2005). The Copenhagen Burnout Inventory: A new tool for the assessment of burnout. *Work & Stress, 19*(3), 192-207. https://doi.org/10.1080/02678370500297720
- Maslach, C., & Leiter, M. P. (2016). Understanding the burnout experience: Recent research and its implications for psychiatry. *World Psychiatry, 15*(2), 103-111. https://doi.org/10.1002/wps.20311
- World Health Organization. (2019, May 28). *Burn-out an "occupational phenomenon": International Classification of Diseases.* https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases

## Author

Hisham Albaiti, King Abdulaziz University
