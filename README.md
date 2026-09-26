# portfolio

A minimal, personal portfolio showcasing work in computer science, AI, education, and public impact.

## Overview

A static, multi-page portfolio site built with HTML, CSS, and vanilla JavaScript. No frameworks, no dependencies, no build step. Each section — about, experience, projects, leadership, contact — is its own page with a consistent design system.

Designed for clarity and speed. Deployed on Vercel.

## Pages

- **`index.html`** — home, with key metrics and current role
- **`about.html`** — background, philosophy, and approach
- **`experience.html`** — timeline of work, internships, and volunteering
- **`projects.html`** — selected work across education, research, and technology
- **`leadership.html`** — extracurricular roles and student organizations
- **`contact.html`** — links and ways to connect

## Tech stack

- HTML5, semantic markup
- CSS3 with custom properties and fluid typography
- Vanilla JavaScript (scroll-reveal, navigation, year update)
- Deployed on Vercel

## Running locally

```bash
# Python 3
python3 -m http.server 8000

# or Node.js
npx http-server
```

Then open `http://localhost:8000`.

## Deploying

This repo is already configured for Vercel. Push to GitHub and import the repository in Vercel — no build command needed, it's all static.

## Design

Black and white, minimal aesthetic. No gradients, no shadows, just clear typography and intentional whitespace. Custom properties for colors, spacing, and type scale.

## License

MIT — see [LICENSE](LICENSE).
