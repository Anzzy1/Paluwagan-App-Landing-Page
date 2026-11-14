# Paluwagan download website

Static landing page for the Paluwagan app (no build step): `index.html`, `styles.css`, `script.js`, `config.js`.

- **Preview:** open `index.html` in a browser, or run `npx serve .`
- **Deploy:** import this folder into Vercel as a new project (framework: Other, no build command).
- **Web app link:** `webAppUrl` in `config.js`.
- **APK link:** `apkUrl` in `config.js` (applied to every `.apk-link`; also hard-coded as the fallback `href` in `index.html`).
- **Download buttons:** Windows / iOS cards in the `#download` section show "Coming soon". When a build is ready, swap the `<button data-soon>` for an `<a href="...">`.

## Feedback form setup (one time)

Feedback is saved to the app's Supabase project, in a `website_feedback` table.

1. Supabase → SQL Editor → run `supabase/website_feedback.sql`.
2. Read submissions in Table Editor → `website_feedback`.

Visitors can only insert rows. Nobody can read them through the public key.
