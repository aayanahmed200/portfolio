# Aayan Ahmed — Portfolio

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS) [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

A responsive portfolio built with semantic HTML, shared CSS, and vanilla JavaScript.

**Live site:** https://aayanahmed200.vercel.app

## Pages

- `/` — Introduction, projects, research, recognition, and contact.
- `/projects` — Project case studies and technical details.
- `/experience` — Experience, research, awards, leadership, and skills.
- `/resume` — Alias for `/experience`.
- `/facts` — Personal interests and milestones.
- Unknown routes — Custom `404.html` page.
- `/miscellaneous` — Redirects to `/facts`.

## Design and technology

- Warm light palette: paper `#F4F2ED`, surface `#FFFDF8`, ink `#171815`, orange `#E9673B`, and soft-yellow button hover `#F1D77F`.
- DM Sans and Instrument Serif typography, fixed navigation, responsive layouts, and restrained transitions.
- Semantic HTML, one shared stylesheet, and vanilla JavaScript. No front-end framework or package installation is required to serve the site.
- `script.js` handles navigation, reveals, page interactions, and the page-transition loader. `analytics-init.js` initializes Vercel Web Analytics.

## Run locally

```bash
node .portrait-hd-parts/assemble.mjs
python3 -m http.server 8000
```

Open http://localhost:8000. Node.js is only needed for the portrait assembly step; any static file server can serve the site.

## Deployment and search

Vercel serves the repository root as a static site. `vercel.json` enables clean URLs and maps `/resume` to the experience page. The site includes page-specific metadata, canonical URLs, Open Graph and Twitter tags, structured data, `robots.txt`, `sitemap.xml`, and a Google Search Console verification file.

## Project notes

Project statuses are described accurately: Arthic is in early access with its AI mentor in development; Zariya is in development; RemiChain is a prototype; and the checked-in retinopathy pilot uses synthetic data and mock predictions, not real model-accuracy results.

## Links

- [Live portfolio](https://aayanahmed200.vercel.app)
- [LinkedIn](https://linkedin.com/in/aayanahmed20)
