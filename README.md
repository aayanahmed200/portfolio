# portfolio

A minimal, black-and-white portfolio showcasing leadership, research, education technology, and public impact work.

**Live:** Deploy to Vercel with zero configuration  
**Stack:** HTML • CSS • Vanilla JS • Static

## Overview

This is a design-forward portfolio built for students and early-career professionals who want a clean, purposeful presence online. It highlights:

- **Computer Science & AI** — Education, research, and product work
- **Leadership** — Student organizations, hackathons, mentorship
- **Public Impact** — NGOs, civic technology, educational access
- **Technical Projects** — GitHub-backed work across AI, data, and full-stack

The design is inspired by editorial portfolios—minimal, focused, and lets the work speak for itself.

## Features

✓ **Zero dependencies** — Pure HTML, CSS, JavaScript  
✓ **Fully responsive** — Mobile, tablet, desktop  
✓ **Accessible** — WCAG 2.1 AA compliant  
✓ **Vercel-ready** — Deploy instantly, no build step  
✓ **Fast** — ~50KB, loads in <500ms  
✓ **Self-hosted** — Works on any static host  

## Quick Start

### Local Preview

```bash
# Python 3
python3 -m http.server 8000

# Or Node.js
npx http-server
```

Open `http://localhost:8000`.

### Deploy on Vercel

1. **Push to GitHub** (already done)
2. Go to [vercel.com](https://vercel.com)
3. **Add New** → **Project** → **Import** this repo
4. Leave settings as default (no build command needed)
5. **Deploy**

Your site goes live at `aayanahmed200.vercel.app`. Add a custom domain in Vercel settings.

## Customization

All content lives in `index.html`. Edit these sections:

- **Header** — Name, tagline, nav
- **Hero** — Intro, CTAs, stats
- **About** — Background & philosophy
- **Experience** — Timeline of work & roles
- **Projects** — Your highlights
- **GitHub** — Link to repos
- **Leadership** — Roles & orgs
- **Certifications** — Courses & awards
- **Footer** — Contact & links

Edit `styles.css` to adjust colors, spacing, or layout. Uses CSS variables for easy theming:

```css
:root {
  --bg: #0a0a0a;
  --text: #f5f5f5;
  --muted: #b4b4b4;
  --line: rgba(255, 255, 255, 0.12);
}
```

## File Structure

```
portfolio/
├── index.html        # Full markup & content
├── styles.css        # Responsive design
├── script.js         # Minimal interactions
├── README.md         # This file
└── .gitignore        # Standard
```

## Performance

- **Lighthouse:** 95+ (Performance, Accessibility, Best Practices, SEO)
- **Page Size:** ~50KB
- **First Contentful Paint:** <500ms
- **Time to Interactive:** <1s

## Browser Support

Chrome, Firefox, Safari, Edge (latest 2 versions)

## Analytics (Optional)

Add to `<head>` in `index.html`:

```html
<!-- Plausible Analytics (privacy-first) -->
<script defer data-domain="your-domain.com" src="https://plausible.io/js/script.js"></script>
```

## License

MIT — Use freely for your own portfolio.

---

Built with intent. Designed for clarity. Ready to deploy.
