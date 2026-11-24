# Aayan Ahmed — Portfolio

**Live:** [aayanahmed200.vercel.app](https://aayanahmed200.vercel.app)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS) [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

A responsive personal portfolio built with semantic HTML, shared CSS, and vanilla JavaScript.

## Overview

The site brings together an introduction, projects, recognition, research and experience, a resume, personal facts, and contact information.

## How it was made

Hand-written HTML, CSS and JavaScript with no framework and no build step. Every page shares one stylesheet and a small script for navigation, page transitions and the interactive pieces, so a change to the layout lands everywhere at once.

The portrait is stored in the repository as base64 fragments, which a small Node script decodes into the WebP the pages load, so the image ships without a separate asset host. Pages carry search metadata, structured data, canonical URLs, a sitemap and robots directives, and the whole thing is served as static files from Vercel with Vercel Web Analytics for traffic.

## Highlights

- Homepage with projects, Featured In, About, research and experience, and contact.
- Separate project case studies and resume pages, plus a personal Facts page.
- Responsive layouts, custom 404 page, accessible navigation, and page transitions.
- Search metadata, structured data, canonical URLs, sitemap, and robots directives.

## Repository contents

- `index.html` — the homepage.
- `projects.html`, `experience.html`, `facts.html`, `miscellaneous.html` — the other pages.
- `404.html` — the not-found page.
- `styles.css`, `script.js`, `analytics-init.js` — the shared stylesheet, page behaviour and the analytics snippet.
- `arcade.js`, `arcade3d.js` — the browser-only interactive pieces.
- `assets/` — portraits, scene art and the images the pages reference.
- `.portrait-hd-parts/` — the base64 portrait fragments and the script that assembles them.
- `robots.txt`, `sitemap.xml`, `vercel.json` — crawling, the sitemap and the Vercel project config.

## Notes and limitations

The site is static, so there is no server to render anything per visitor; every page is the file in the repository. Node.js is only needed for the portrait assembly step, and once the assets are in place any static file server can serve the portfolio.

## License

MIT
