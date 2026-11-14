# Aayan Ahmed — Personal Portfolio

A lightweight, responsive portfolio built with semantic HTML, shared CSS, and vanilla JavaScript.

**Live site:** https://aayanahmed200.vercel.app  
**Profile:** https://github.com/aayanahmed200

## Pages and routes

| Route | File | Content |
|---|---|---|
| `/` | `index.html` | Introduction, selected projects, research and experience, recognition, and contact |
| `/projects` | `projects.html` | Project write-ups, links to source repositories, and technical toolkit |
| `/experience` | `experience.html` | Education, research, experience, awards, leadership, and skills |
| `/resume` | Alias for `/experience` | Convenient résumé route |
| `/facts` | `facts.html` | Personal interests and milestones |
| Unknown routes | `404.html` | Custom not-found page |

The old `/miscellaneous` route redirects visitors to `/facts`.

## Design

The site uses a warm light palette and an editorial layout:

- Paper background: `#F4F2ED`
- Surface: `#FFFDF8`
- Ink: `#171815`
- Orange accent: `#E9673B`
- Pastel cyan: `#BCE8ED`
- Shared button hover: soft yellow `#F1D77F`

Typography uses DM Sans and Instrument Serif. The fixed navigation, responsive page layouts, restrained transitions, and shared button states are defined in `styles.css`.

## Implementation

- Semantic HTML pages with one shared stylesheet and vanilla JavaScript.
- No front-end framework or npm dependency installation.
- `script.js` handles navigation state, reveal animations, small page interactions, and the page-transition loader.
- `analytics-init.js` initializes Vercel Web Analytics.
- The portrait is assembled from source fragments by `.portrait-hd-parts/assemble.mjs`.

## Run locally

From the repository root:

```bash
node .portrait-hd-parts/assemble.mjs
python3 -m http.server 8000
```

Then open http://localhost:8000.

The portrait assembly step uses Node.js. The local server can be any static-file server.

## Deployment

Vercel serves the repository root as a static site. The current `vercel.json` runs:

```bash
node .portrait-hd-parts/assemble.mjs
```

It enables clean URLs and maps `/resume` to the experience page.

## SEO and indexing

- Page-specific titles and meta descriptions.
- Canonical URLs, Open Graph and Twitter metadata.
- Person and WebSite structured data on the homepage.
- `robots.txt` and `sitemap.xml`.
- Google Search Console HTML verification file at the site root.

## Project accuracy

Project statuses are described as they currently stand: Arthic is in early access with its AI mentor in development; Zariya is in development; RemiChain is a prototype; and the checked-in retinopathy pilot results are synthetic mock outputs, not real model-accuracy results.

## Contact

- Email: aayanahmed2913@gmail.com
- LinkedIn: https://linkedin.com/in/aayanahmed20
- GitHub: https://github.com/aayanahmed200
