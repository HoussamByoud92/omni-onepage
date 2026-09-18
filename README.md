# Omnibuild — One-page site

Immersive one-page landing site for **Omnibuild**, a Casablanca workspace fit-out studio
(*aménagement des espaces*).

Built with plain **HTML + CSS + vanilla JavaScript** — no frameworks, no build step.

## Run locally

The contact form (FormSubmit) only works when the page is **served over http**, not opened
as a local file. Start any static server from this folder:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Stack

- `index.html` · `style.css` · `script.js`
- [anime.js](https://animejs.com/) for the motion timelines
- [FormSubmit.co](https://formsubmit.co/) for the contact form (no account / no keys)
- `assets/` — logo and optimized project photos

## Contact form

Posts to FormSubmit for `contact@omnibuild.ma` and auto-replies to the sender. The **first**
submission (on the live/hosted site) triggers a one-time activation email to
`contact@omnibuild.ma` — click its link once to switch delivery on.

## Design

“Living blueprint” direction — architectural fit-out aesthetic, brand emerald `#00A553`,
Space Grotesk / Space Mono / Manrope type. Content and imagery are Omnibuild's own.
