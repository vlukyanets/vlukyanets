## Project
GitHub profile README (`README.md`) plus a tiny Vercel backend for its badges,
deployed at https://vlukyanets.vercel.app.
- `api/*.js` are Vercel functions returning shields.io endpoint JSON; the README
  embeds them as `https://img.shields.io/endpoint?url=https://vlukyanets.vercel.app/api/<name>`.
- `api/_badge.js` holds the shared response and cache header; files starting
  with `_` are not routes. New badge = new `api/<name>.js` using it + an `<img>` in README.
- No `package.json`, no build step, plain CommonJS on Vercel's Node runtime.
- `vercel.json`: root redirects to the GitHub profile; builds are skipped
  unless `api/` or `vercel.json` changed.
- Logos that third-party sites may move live in `assets/`.
- `.github/workflows/links.yml` checks README links and the badge endpoints
  weekly and opens an issue on failures; actions are pinned by SHA and bumped by Dependabot.

## Commits and branches
- Make changes in separate branch
- Branch names are short, lowercase, hyphenated and say what changes
  (`add-some-new-site`); no generated names or `claude/` prefixes.
- Subject: one line, imperative, plain language. Body: optional, one paragraph.
- No Conventional Commits prefixes, no AI attribution lines in commits or
  pull requests.
