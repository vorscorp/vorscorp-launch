# Vorscorp — temporary launch page

The single page served at **vorscorp.com** until the full institutional site
launches on **15 October 2026, 00:00 Malaysia Time (UTC+08:00)**.

This is **not** the Vorscorp website. That is a separate build, unaffected by
anything here. This repo exists to be replaced.

## What is on the page

The wordmark, the positioning line, the launch date, a live countdown, one
supporting sentence, and a colophon carrying the copyright line and two social
links. Nothing else, deliberately. Do not add sections, forms, metrics, or
pages: the restraint is the design.

Both social URLs were verified against live pages rather than assumed:
`https://instagram.com/vorscorp` and `https://www.linkedin.com/company/vorscorp`.
If an account moves, fix the `href` in `index.html`; nothing else references
them.

## Stack

Static HTML, CSS and vanilla JavaScript. No framework, no build step, no
dependencies, no external network calls at runtime. Five files load in total.

```
index.html
assets/css/site.css
assets/js/scramble.js      word-by-word hover scramble
assets/js/countdown.js     countdown + launch state
assets/fonts/InterVariable.woff2
assets/brand/vorscorp-wordmark-white.png
assets/brand/vorscorp-og.png
```

## Run it locally

```bash
python3 -m http.server 4322
```

Then open http://localhost:4322. Paths are root-absolute, so open it through a
server rather than as a `file://` document.

## Deploy

Any static host. On Vercel: import the directory, framework preset **Other**,
no build command, output directory `.`. `vercel.json` only sets cache headers.
Point the `vorscorp.com` apex and `www` records at the deployment.

On 15 October 2026 this deployment is replaced by the full site.

## The two moving parts

**Countdown** (`countdown.js`) targets the absolute instant
`2026-10-15T00:00:00+08:00`. The offset is written into the timestamp, so it
resolves to the same moment regardless of the reader's timezone. Ticks are
re-aimed at the next whole second, so the display cannot drift after the tab
has been backgrounded. At zero the digits are replaced by a launch state; the
page never shows negative numbers.

**Scramble** (`scramble.js`) is opt-in per element:

```html
<span class="scramble">Engineering</span>
```

Any element with that class gets it, and each is independent: hovering one word
never touches another. On activation the word's rendered width is locked and
each character becomes a fixed-width cell, so a line never reflows mid
animation. Substitute glyphs are chosen by measured width, so a random
character is never wider than the cell holding it. Duration is derived from
word length and capped, so it is always fast and always the same. The original
string is always restored exactly.

It is disabled entirely on touch devices (`hover: hover and pointer: fine`) and
under `prefers-reduced-motion: reduce`, and elements only become keyboard
focusable when the interaction is actually available, so no dead tab stops are
introduced.

## Composition

One centred column, in this order: wordmark, positioning line, launch date,
countdown, supporting sentence, then the colophon pinned to the foot of the
screen. Two static hairlines frame the column on viewports 1024px and wider.

The positioning line carries one fixed break, after "Engineering", because
that is where it reads. The second line wraps on its own when the screen is
too narrow to hold it, so small phones get three lines without a breakpoint
having to decide.

## Vertical fit

The page is built to resolve on a single screen. Type scale is capped against
viewport height as well as width, and below 620px of height the rhythm between
the elements compresses rather than the type, so the hierarchy never changes.
Verified to fit with zero overflow from 320x568 up to 2560x1440. Landscape
phones (roughly 390px of height) scroll by about 50px, which is accepted: the
alternative is type too small to carry the mark.

One trap worth remembering: the entrance animation rises elements by 10px, and
a downward transform on the bottom-most box counts as scrollable overflow. The
colophon therefore fades in without rising, otherwise every desktop load
flashes a scrollbar.

## Brand assets

`assets/brand/vorscorp-wordmark-white.png` is the supplied wordmark,
unmodified. Do not regenerate, retrace, recolour or add effects to it. If true
SVG masters are ever exported, they are a drop-in replacement.

`vorscorp-og.png` is the link-preview image: that same wordmark placed on the
brand field at 1200x630. Nothing was redrawn.

`vorscorp-wordmark-dark.png` is the dark-ink version, kept alongside but not
referenced by the page, which is dark-field only. It is there so a light
context never tempts anyone to recolour the white one.

## Colour and type

Near black `#0B0B0B`, warm off-white `#F6F5F2`, grey `#A1A1A1`. Nothing else.
Inter (self-hosted variable subset) for everything, with the system monospace
stack for the small technical labels.
