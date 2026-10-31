# r3lik-site

> **Build output.** This repo is what [dev.r3lik.com](https://dev.r3lik.com) serves, published by `tools/deploy_pages.py` from the private source repo on every deploy as a single commit. Don't edit it here: changes are overwritten. The layout below describes the source repo.

Redesign of [r3lik.com](https://r3lik.com), the personal site of Mike Czarny (r3lik), built together with his AI
agent chkm8. Design curated by r3lik; code, screenshots and commits by chkm8. Preview: https://dev.r3lik.com

## Stack

No framework and no server-side app (no Flask, React or bundler). The site is static files that the browser
renders directly; a few Python scripts build the data and publish it.

| Layer | What we use |
|---|---|
| Pages | Hand-written HTML, CSS and vanilla JavaScript. Modern CSS (grid, custom properties, `color-mix(in oklab)`, `text-wrap: balance`), native `<dialog>` for the screenshot lightbox, inline SVG for the station clock, departures board, flags and the robot |
| Content | JSON files fetched at runtime: `content/projects.json`, `content/learning.json`, `content/setup.json`, and the live `status.json`. Markdown mirrors for agents: `index.md`, `llms.txt` |
| Fonts | Self-hosted WOFF2: Rules Gothic Condensed/Compressed (Blaze Type, the face Hermes Agent uses; commercial, not covered by this repo's MIT licence), Instrument Serif (chkm8's voice) and JetBrains Mono, both OFL. Free fallback stack in `shared/fonts-free.css` (Archivo + Big Shoulders Display, OFL), preview with `?font=free` |
| Live data | `tools/build_status.py` reads chkm8's Hermes Agent cron schedule and writes `status.json` (allowlisted job labels only: no prompts, errors or private jobs). `tools/build_log.py` writes `log.json` from git history, published counter-only (commit counts and timestamps, plus the number of edits from the agent's session log) |
| Tooling | Python 3 standard library. `tools/serve.py` is a no-cache preview server (`python3 tools/serve.py 8420`) |
| Screenshots | Captured from headless Chromium over the Chrome DevTools Protocol, converted to WebP with Pillow. Newsletter shots are rendered by chkm8's mailer (headless Brave). The link-preview card is `tools/og-card.html` rendered at 1200x630; the favicon glyph was extracted with fontTools |
| Hosting | The source repo is private. GitHub Pages serves the built site from the public deploy-only repo [chkm8-agent/r3lik-site-pages](https://github.com/chkm8-agent/r3lik-site-pages) (branch `gh-pages`), custom domain `dev.r3lik.com` (DNS at DigitalOcean), HTTPS by Let's Encrypt via GitHub |
| Deploys | `tools/deploy_pages.py` builds `dist/` from `origin/main` plus a fresh `status.json` and force-pushes it to the deploy repo as one commit, with no history. A Hermes Agent cron job runs it every 15 minutes, so the job board stays live without commits to main. Pushing main = publishing |
| Guard rails | A git clean/smudge filter swaps private values for `<redacted:…>` placeholders on commit and restores them on checkout; pre-commit and pre-push hooks run gitleaks and a private-data scanner; the deploy refuses to publish if a private value or public IP shows up; a commit hook adds r3lik as co-author on every commit. See `infra/git/` in [chkm8-agent/chkm8](https://github.com/chkm8-agent/chkm8) |

## Layout

- `a4-handoff/`: the chosen design, published as the site root; `station.js` draws the clock and departures board
- `index.html`, `round-1.html`, `a-marginalia/`, `a2-margin/`, `a3-redline/`, `b-console/`, `c-poster/`: lookbook and the other design directions from the mockup rounds
- `shared/`: the `~` console, data helpers, font CSS and the mockup switcher
- `content/`: copy (projects, learning, setup & security); `assets/`: screenshots, preview card, favicon
- `tools/`: builders, preview server and the Pages deploy
- `fonts/` (commercial files) and `dist/` (build output) are gitignored

## License

Code: MIT, see [LICENSE](LICENSE). Fonts keep their own licences.
