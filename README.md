# Aayan Ahmed — Portfolio

A static personal website with project work, experience, a resume and personal interests.

**[Open the portfolio](https://aayanahmed200.vercel.app)**

## Overview

The site presents an introduction, selected projects, research and experience, a resume, personal facts and contact details. It includes a project overview, a custom 404 page and responsive navigation.

## Repository contents

- `index.html` — homepage.
- `projects.html` — project summaries and links to the projects.
- `experience.html` — resume and experience.
- `facts.html` and `miscellaneous.html` — personal interests and additional content.
- `404.html` — custom not-found page.
- `styles.css` and `script.js` — shared layout, styling and interactions.
- `assets/` — images, icons and project artwork.
- `vercel.json` — clean URL configuration, redirects and response headers.

## Technology

Semantic HTML, CSS and vanilla JavaScript. The site is deployed as static files on Vercel and uses Vercel Web Analytics.

## Run locally

For a preview that follows the clean URLs configured in `vercel.json`, use the Vercel CLI:

```bash
npx vercel dev
```

A basic static server can also serve the HTML files, but it does not reproduce Vercel's extensionless routes. Open the individual `.html` files directly when using a basic server.

## Scope and limitations

This repository is the source for the portfolio website; it does not contain a backend application or user account system. Some content links to external projects and services, which are maintained separately.

## License

The portfolio's software source code and associated technical documentation are licensed under the MIT License. See [LICENSE](LICENSE) for the full text. Personal photographs, portrait images, original artwork, logos, wordmarks and other branding are excluded; see [ASSET-RIGHTS.md](ASSET-RIGHTS.md).
