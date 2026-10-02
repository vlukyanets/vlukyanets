## Project
GitHub profile README (`README.md`) plus a tiny Vercel backend for its badges,
deployed at https://vlukyanets.vercel.app.
- `api/*.js` are Vercel functions returning shields.io endpoint JSON; the README
  embeds them as `https://img.shields.io/endpoint?url=https://vlukyanets.vercel.app/api/<name>`.
- `api/_badge.js` holds the shared response and cache header; files starting
  with `_` are not routes. New badge = new `api/<name>.js` using it, an `<img>`
  in README and its URL in `.github/workflows/links.yml`.
- Merge a new endpoint before the README badge that uses it: right after a merge
  Vercel is still deploying, and shields.io caches the 404 as "resource not found"
  for `cacheSeconds`.
- No `package.json`, no build step, plain CommonJS on Vercel's Node runtime.
- Tests: `node --test` runs `test/badges.test.js` (CI on PRs touching `api/`
  or `test/`). Keep tests out of `api/`: every file there becomes a route.
- `vercel.json`: root redirects to the GitHub profile; builds are skipped
  unless `api/` or `vercel.json` changed.
- Logos that third-party sites may move live in `assets/`.

## README layout
- Icons sit in `<p align="center">` rows, not tables: tables shrink icons to
  ~16px on phones, paragraphs wrap. Each icon is `<a href title><img hspace="6"
  width="40" height="40" alt></a>`; GitHub keeps `hspace` but strips `vspace` and `style`.
- Icons must read on both GitHub themes. Black or near-black icons get a
  `<picture>` with `<source media="(prefers-color-scheme: dark)"
  srcset="https://cdn.simpleicons.org/<slug>/white">`.
- Profile icons are square. Sites without a usable square icon get one in
  `assets/` as an 80×80 PNG (shown at 40px), cut from the site's own artwork,
  on a rounded tile when the mark needs a background to stay visible.
- Check README changes on a phone width too: no row or table wider than ~340px.
- `.github/workflows/links.yml` checks README links and the badge endpoints
  weekly and opens an issue on failures; actions are pinned by SHA and bumped by Dependabot.

## Commits and branches
- Make changes in separate branch
- Branch names are short, lowercase, hyphenated and say what changes
  (`add-some-new-site`); no generated names or `claude/` prefixes.
- Subject: one line, imperative, plain language. Body: optional, one paragraph.
- No Conventional Commits prefixes, no AI attribution lines in commits or
  pull requests.
