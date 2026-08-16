# Vorscorp Launch Page Session Handoff

Paste this into a new session to continue the work. Current state as of the
deploy on 16 August 2026.

## Repository
- **Location on disk:** `~/Claude/Vorscorp/Coding/vorscorp-launch`
- **GitHub:** `https://github.com/vorscorp/vorscorp-launch` (public)
- **Branch:** `main`. A push to `main` deploys. There is no protected branch
  and no PR flow: this is a one page holding site, not the institution's site.
- **No toolchain.** No Node, no npm, no build step, no dependencies. Editing a
  file and pushing it is the whole workflow.

## What this is
A single static page holding `vorscorp.com` until the full institutional site
launches on 15 October 2026, 00:00 Malaysia Time (UTC+08:00). This repo exists
to be replaced.

**It is not the Vorscorp website.** That is a separate repository
(`vorscorp/vorscorpwebsite`, private, spec-first Next.js, branch
`phase-0/substrate`) and it is still not deployed. Nothing here feeds it and
nothing there feeds this. Confirm which one is meant before editing either.

## Live
- **URL:** https://vorscorp.com. `www` returns a 308 to the apex.
- **Host:** Vercel, project `vorscorp-launch`, team `tariqharziqs-projects`,
  Hobby plan. Linked to the GitHub repo, so deploys are automatic.
- **DNS:** GoDaddy holds the zone (`ns37/ns38.domaincontrol.com`). One A record
  on `@` pointing at Vercel, one CNAME on `www` pointing at the apex.
- **Certificates:** Let's Encrypt on both hostnames, renewing automatically.
- **Weight:** six requests, about 150 KB, most of it the Inter subset.

## Deliberate constraints
These are design decisions, not oversights. Changing them needs a reason.
- **Do not add** pages, sections, product cards, an About, contact or
  newsletter forms, social walls, statistics, or testimonials. The emptiness is
  the point. The page should not imply the organisation is bigger than it is.
- **The wordmark is used exactly as supplied.** Never regenerate, retrace,
  recolour, distort, or add effects to it. If true SVG masters ever exist they
  are a drop-in replacement for the PNGs.
- **Monochrome only:** `#0B0B0B`, `#F6F5F2`, `#A1A1A1`. No fourth colour.
- **Motion stays minimal.** One entrance pass, the countdown, the scramble.
  Nothing loops, nothing moves in the background.
- **No em-dashes** anywhere, matching the main site's house rule. Use periods
  or middle dots.
- **The scramble must always resolve** to the original string, and must stay
  off on touch devices and under `prefers-reduced-motion`.

## Run it
```bash
python3 -m http.server 4322
```
Then open http://localhost:4322. Paths are root absolute, so it must be served
rather than opened as a `file://` document.

## Change it
Edit, commit, push to `main`. Live in seconds. There is nothing to build and
no dashboard step.

## Traps, each one hit and fixed
1. **GoDaddy forwarding loops against Vercel.** Forwarding sends the apex to
   the Vercel URL, and Vercel sends it back to the apex. Both URLs go dead.
   Point DNS records at Vercel; never use GoDaddy forwarding.
2. **GoDaddy's `Parked` record is a real A record.** It shows as the word
   "Parked" instead of an IP, so it does not look like the conflicting record
   Vercel is asking you to remove. It is. Delete it.
3. **`/:path*` does not match the bare root** in a Vercel redirect. Subpaths
   redirect and the homepage silently does not. The `redirects` block in
   `vercel.json` therefore carries a `/` rule and a `/:path+` rule.
4. **A downward transform on the bottom-most element counts as scrollable
   overflow.** The entrance animation rises elements by 10px, which flashed a
   scrollbar on every desktop load. The colophon fades without rising.
5. **Scramble substitute glyphs must be filtered by measured width.** A random
   `W` in a cell sized for an `i` overflows and overlaps its neighbours.
   `scramble.js` measures the charset and picks only glyphs that fit.
6. **The countdown target must be an absolute instant.** The UTC+08:00 offset
   is written into the timestamp so it resolves identically in every timezone.
   Never rebuild it from local time parts.

## Verified at the last pass
Fits one screen with zero vertical or horizontal overflow from 320x568 to
2560x1440. CLS 0. No console errors. Countdown checked against an independent
recomputation and against Kuala Lumpur, New York and UTC. Launch state at T-0
shows a launched state rather than negative numbers. Scramble survives rapid
repeated hover and always restores. Keyboard reaches the four words and both
links. Touch devices get static type and no dead tab stops.

Landscape phones (about 390px of height) scroll by roughly 50px. Accepted: the
alternative is type too small to carry the mark.

## Open items
1. **The 15 October 2026 cutover.** Going live with the full site means
   repointing `vorscorp.com` off this deployment. It is a real step with DNS
   and a Vercel domain move in it, not a switch. This repo is retired at that
   point.
2. **The main site's `HANDOFF.md` is out of date.** It still says "Nothing is
   deployed" and its Gate P item lists "Vercel + domain" as though the domain
   were free. The apex now serves this page. That file was deliberately left
   alone because the repo has uncommitted work in it. Someone should correct it
   there.
3. **The `www` redirect lives in `vercel.json`,** not as a Vercel dashboard
   domain setting. If anyone later sets a dashboard redirect as well, remove
   one of the two so a single rule owns the behaviour.
4. **`assets/brand/vorscorp-wordmark-dark.png`** is committed but unused. It is
   kept so that a light background never tempts anyone into recolouring the
   white one.

## Working agreement
Small, reversible edits. Check the page still fits one screen and that the
countdown and scramble still behave before pushing, because a push is a deploy.
Do not add features to fill space.
