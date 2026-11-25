# Aayan Ahmed — Portfolio

> A responsive personal portfolio presenting my projects, research and experience, background, and contact information.

**Live portfolio:** [aayanahmed200.vercel.app](https://aayanahmed200.vercel.app/)

[![HTML5](https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) [![CSS3](https://img.shields.io/badge/css3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS) [![JavaScript](https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![Vercel](https://img.shields.io/badge/vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

## Overview

This repository contains my static personal website. It introduces me and brings together project case studies, recognition, research and experience, a resume, personal facts, and contact links.

## Highlights

- Homepage with project highlights, Featured In, About, and contact sections.
- Dedicated project case-study, experience/resume, and personal-facts pages.
- Responsive layouts, shared navigation, custom 404 page, and page-transition effects.
- Search metadata, structured data, canonical URLs, sitemap, robots directives, and Vercel Web Analytics.
- Browser-based interactive elements stored in the repository's JavaScript files.

## Implementation

The site uses hand-written semantic HTML, shared CSS, and vanilla JavaScript. It has no frontend framework or package-manager build step. Vercel serves the static files and runs a small Node.js build command that assembles a verified WebP portrait from source fragments before deployment.

The pages share `styles.css` and `script.js` for visual styling and browser behaviour. SEO metadata is included in the HTML, with a sitemap and robots policy at the repository root.

## Repository structure

- `index.html` — homepage.
- `projects.html`, `experience.html`, `facts.html`, and `miscellaneous.html` — supporting pages.
- `404.html` — custom not-found page.
- `styles.css`, `script.js`, and `analytics-init.js` — shared styles, interactions, and analytics setup.
- `arcade.js` and `arcade3d.js` — browser-based interactive experiences.
- `assets/` — portrait, illustrations, and other page assets.
- `.portrait-hd-parts/` — build-time portrait fragments and the assembly script.
- `robots.txt`, `sitemap.xml`, and `vercel.json` — crawling policy, sitemap, and Vercel configuration.

## Status and limitations

This is a static website: pages are delivered as files and there is no server-side user account or per-visitor rendering layer. The Node.js portrait assembly script is part of the Vercel build process; the site itself can be served as static files once its assets are present.

## License

MIT. See [LICENSE](LICENSE).
