* {
  box-sizing: border-box;
}

:root {
  --bg: #0a0a0a;
  --panel: #121212;
  --panel-strong: #171717;
  --line: rgba(255, 255, 255, 0.12);
  --text: #f5f5f5;
  --muted: #b4b4b4;
  --soft: #eeeeee;
  --shadow: rgba(0, 0, 0, 0.35);
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: "Inter", sans-serif;
  line-height: 1.6;
}

img {
  max-width: 100%;
  display: block;
}

p, li {
  color: var(--muted);
}

h1, h2, h3 {
  margin: 0;
  font-weight: 600;
  letter-spacing: -0.04em;
  color: var(--text);
}

h1 {
  font-size: clamp(3rem, 7vw, 6.2rem);
  line-height: 0.96;
  max-width: 600px;
}

h2 {
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.05;
}

h3 {
  font-size: clamp(1.2rem, 2vw, 1.8rem);
}

.page-shell {
  width: min(1200px, calc(100% - 40px));
  margin: 0 auto;
  padding: 24px 0 80px;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0 36px;
  border-bottom: 1px solid var(--line);
}

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.eyebrow {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--muted);
}

.brand-sub {
  font-size: 0.78rem;
  color: var(--soft);
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
}

.main-nav a,
.footer-links a,
.repo-list a {
  color: var(--text);
  text-decoration: none;
  transition: opacity 180ms ease;
}

.main-nav a:hover,
.footer-links a:hover,
.repo-list a:hover {
  opacity: 0.65;
}

.hero {
  display: grid;
  grid-template-columns: 1.5fr 0.7fr;
  gap: 40px;
  padding: 64px 0 28px;
  align-items: end;
}

.kicker,
.section-kicker,
.footer-label {
  font-size: 0.74rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 18px;
}

.hero-copy {
  max-width: 760px;
}

.hero-copy h1 span {
  display: block;
}

.intro {
  font-size: 1.08rem;
  max-width: 620px;
  margin-top: 24px;
  color: var(--muted);
}

.cta-row {
  display: flex;
  gap: 14px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 128px;
  padding: 12px 18px;
  border: 1px solid var(--line);
  text-decoration: none;
  font-weight: 600;
  transition: transform 180ms ease, background 180ms ease, color 180ms ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button.primary {
  background: var(--text);
  color: var(--bg);
}

.button.secondary {
  background: transparent;
  color: var(--text);
}

.meta-grid {
  list-style: none;
  padding: 0;
  margin: 40px 0 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(100px, 1fr));
  gap: 18px;
}

.meta-grid li {
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

.meta-number {
  display: block;
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
  font-weight: 700;
  color: var(--text);
}

.meta-label {
  display: block;
  color: var(--muted);
  margin-top: 6px;
  font-size: 0.8rem;
  letter-spacing: 0.03em;
}

.hero-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005));
  border: 1px solid var(--line);
  box-shadow: 0 30px 80px var(--shadow);
  min-height: 320px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 24px;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--text);
  display: inline-block;
}

.card-body {
  padding: 22px 24px 26px;
}

.card-label {
  margin: 0 0 8px;
  font-size: 0.7rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--muted);
}

.card-copy {
  margin: 0 0 18px;
  color: var(--soft);
}

.card-copy.tight {
  margin-bottom: 0;
}

.section-block {
  padding-top: 72px;
}

.section-header {
  margin-bottom: 30px;
}

.two-column {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 26px;
  align-items: start;
}

.two-column p {
  margin: 0 0 18px;
  font-size: 1.02rem;
}

.statement-box {
  background: var(--panel);
  border: 1px solid var(--line);
  padding: 26px 24px;
}

.statement-box p {
  margin: 0;
  color: var(--text);
  font-size: clamp(1.3rem, 2vw, 2rem);
  line-height: 1.2;
  font-family: "Cormorant Garamond", serif;
}

.timeline {
  display: grid;
  gap: 20px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 20px;
  padding: 18px 0;
  border-top: 1px solid var(--line);
}

.timeline-date {
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.74rem;
}

.timeline-content h3 {
  margin-bottom: 8px;
}

.timeline-content p {
  margin: 0;
  color: var(--muted);
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.project-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
  border: 1px solid var(--line);
  padding: 22px 20px;
}

.project-card.wide {
  grid-column: 1 / -1;
}

.project-meta {
  color: var(--muted);
  font-size: 0.7rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.project-card p {
  margin: 0;
  color: var(--muted);
}

.repo-list {
  display: grid;
  gap: 14px;
}

.repo-list a {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.01);
  align-items: center;
}

.repo-name {
  font-weight: 600;
  color: var(--text);
}

.repo-detail {
  color: var(--muted);
  text-align: right;
}

.bullets {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
}

.cert-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.cert-item {
  padding: 18px 16px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.01);
  color: var(--soft);
}

.awards-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.awards-strip div {
  border: 1px solid var(--line);
  padding: 18px 16px;
  background: rgba(255,255,255,0.01);
  color: var(--soft);
  min-height: 86px;
  display: flex;
  align-items: center;
}

.site-footer {
  margin-top: 80px;
  padding-top: 28px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: end;
}

.site-footer h3 {
  margin-top: 12px;
  font-size: clamp(1.4rem, 3vw, 2.4rem);
}

.footer-links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .hero,
  .two-column,
  .project-grid,
  .cert-grid,
  .awards-strip {
    grid-template-columns: 1fr;
  }

  .hero {
    padding-top: 42px;
  }

  .timeline-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .site-header,
  .site-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .main-nav {
    gap: 12px 16px;
  }

  .repo-list a {
    flex-direction: column;
    align-items: flex-start;
  }

  .repo-detail {
    text-align: left;
  }
}

@media (max-width: 560px) {
  .page-shell {
    width: min(100% - 24px, 1200px);
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }

  .main-nav {
    font-size: 0.95rem;
  }
}
