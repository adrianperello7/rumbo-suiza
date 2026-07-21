# Rumbo Suiza

Static site (plain HTML/CSS/JS, no build step, no backend) guiding Spaniards through moving to Switzerland, in Spanish (`/es/`) and English (`/en/`), with a client-side personalized quiz and an AdSense-ready layout.

## Structure

```
es/            Spanish site (primary)
en/            English site
assets/        Shared CSS, JS, and SVG assets used by both languages
ads.txt        AdSense verification file (placeholder — see below)
```

Open `es/index.html` (or `en/index.html`) directly in a browser to preview — no server or build step required.

## Photos

The hero and page banners use two real Swiss mountain photos hotlinked from Wikimedia Commons (defined once as CSS variables `--photo-summer` / `--photo-winter` in `assets/css/style.css`):

- Summer: "Alps of Switzerland, Lake Sils" by Michael Kuhn (kuhnmi), CC BY 2.0.
- Winter: "Ski Slopes of Verbier" by Realleok, CC BY-SA 4.0.

Both licenses require attribution, which is already included as a small credit line in every page footer — don't remove it if you keep these images. To swap in your own photos: download them into `assets/img/`, then update the two `--photo-summer` / `--photo-winter` values in `style.css` to point at your local files instead of the Wikimedia URLs (better for load speed and gives you full control over licensing).

## Before you go live: things to fill in

Search the project for these placeholders and replace them:

- `TU-EMAIL@ejemplo.com` / `YOUR-EMAIL@example.com` — your real contact email, in `contacto.html` (both languages) and the legal pages.
- `TU-FORM-ID` / `YOUR-FORM-ID` — a real form endpoint (see "Contact form" below).
- `[NOMBRE DEL TITULAR]` / `[SITE OWNER NAME]` — your name or business name, in the privacy policy and terms.
- `ads.txt` — your real AdSense publisher line, once approved.
- The `<script type="text/plain" data-cookie-consent="required">` blocks at the bottom of every page — once you have an AdSense/Analytics snippet, put it inside these blocks (keep `type="text/plain"` and the `data-cookie-consent="required"` attribute) so it only loads after a visitor accepts cookies. `assets/js/main.js` handles activating them automatically.

## Contact form

The contact form currently points at a placeholder Formspree endpoint. Since this is a static site with no backend, you need a third-party form handler to receive submissions by email:

1. Create a free account at [formspree.io](https://formspree.io) (or a similar service like Getform).
2. Create a form, copy the endpoint URL it gives you.
3. Replace `https://formspree.io/f/TU-FORM-ID` in `es/contacto.html` and `https://formspree.io/f/YOUR-FORM-ID` in `en/contacto.html` with your real endpoint.

## Getting a domain

1. Register a domain (e.g. `rumbosuiza.com` or `.es`) through a registrar such as Namecheap, Cloudflare Registrar, or OVH. Costs roughly $10-15/year and requires your own payment details.
2. Keep the WHOIS/contact email accurate — you'll need it to prove ownership later.

## Hosting (free options that work well with this site)

Because this is a plain static site, any of these work with zero configuration changes:

- **Cloudflare Pages** or **Netlify** — drag-and-drop the whole folder, or connect a GitHub repo for automatic deploys. Both offer free custom-domain HTTPS.
- **GitHub Pages** — push this folder to a GitHub repo and enable Pages in the repo settings.

Once deployed, point your domain's DNS at the host following their instructions (usually a CNAME or a few A records), and set `es/index.html` (or a redirect to it) as your homepage — or add a root `index.html` that redirects to `/es/` if you want Spanish as the default landing language.

## Applying to Google AdSense

1. Make sure the site has been live on its real domain for a little while with real traffic — AdSense reviews actual sites, not local files.
2. Go to [google.com/adsense](https://www.google.com/adsense), add your site, and follow their verification steps (usually a meta tag or the `ads.txt` file already set up in this project).
3. Once approved, get your AdSense code snippet and:
   - Add your publisher line to `ads.txt`.
   - Fill in the placeholder `<script type="text/plain" data-cookie-consent="required">` blocks across the site with your real AdSense loader script (keep the `text/plain` type and `data-cookie-consent="required"` attribute so it respects the cookie banner).
   - Replace the `.ad-slot` placeholder `<div>` elements with your actual `<ins class="adsbygoogle">` ad units where you want ads to appear.
4. AdSense generally wants to see real, substantial content and a clear privacy policy before approving — both are already in place here.
