# Aayan Ahmed — Portfolio

Personal portfolio for Aayan Ahmed, built with semantic HTML, CSS and lightweight JavaScript.

## Pages

- `index.html` — introduction, selected projects, featured articles, about and contact
- `projects.html` — individual project summaries and source links
- `about.html` — background and education
- `experience.html` — concise research, experience, leadership and awards
- `leadership.html` — student leadership and community work
- `contact.html` — contact details
- `404.html` — custom not-found page

## Design

A dark editorial layout with a warm cream accent (`#ECDFCC`), a letter-only A mark, consistent pill navigation, readable high-contrast text and a custom scrollbar. The supplied Nishaan homepage screenshot is the only project preview image; the About avatar is a separate profile illustration.

## SEO

- Page-specific titles, descriptions and canonical URLs
- Open Graph and Twitter metadata
- Person and WebSite JSON-LD on the homepage
- `robots.txt` and an XML sitemap at `/sitemap.xml`

## Local development

Run a static server from the repository root:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deployment

The site is hosted on Vercel. There is no build step.
