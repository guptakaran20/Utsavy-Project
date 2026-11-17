# Project context: Harleen & Jasraj — Punjabi wedding invitation site

Give this file to a new Claude chat first. It sums up the project, the design rules, how the code is laid out, what has been built and how the owner likes to work, so nothing needs re-explaining.

---

## 1. What this is

A one-page, scroll-driven digital wedding invitation for a Punjabi Sikh wedding.

- **Couple:** Harleen Kaur (bride) & Jasraj Singh (groom). Families: Sandhu (bride) & Gill (groom).
- **Main event:** Anand Karaj, Sunday 21 February 2027, Amritsar, Punjab. Hashtag `#HarJasDaViah`.
- **Stack:** React 19 + Vite 8, GSAP 3 + ScrollTrigger (`@gsap/react` `useGSAP`), Lenis smooth scroll, Framer Motion (a few places). Plain CSS files per component, no Tailwind.
- **Run:** `npm run dev`, which serves on port **5173** (`.claude/launch.json` has a `wedding` config for the Claude browser preview). Build check: `npx vite build`.
- **All wording, names, dates, events, contacts and photos live in `src/data/wedding.js`.** Edit content there, not in components.

## 2. The theme (read this before designing anything)

The owner corrected this once: **the theme is NOT maroon-and-gold.** The CSS variable names (`--maroon-*`, `--gold-*`) are leftovers from an older version. Judge the theme from the live site, not the variable names.

What the site actually looks like:
- **Opening:** a night plane flight. Deep indigo sky, stars, clouds, gold script names, a "Take off" button. The dhol music starts at take-off.
- **Hero:** bright blue daytime sky, confetti and fireworks, white Cinzel names, and a white-marble gurdwara with gold domes rising. Scrolling walks you through its golden door.
- **Everything after the hero:** **blush-pink paper** with a faint damask pattern (`.sky-bg`), framed by **pink roses, ivory jasmine and green leaves** down both edges (`FloralSides`, image `/florals.webp`). Pearl-and-rose tassels hang at the top of the invitation.
- **Palette in use:**

  | Role | Value |
  |---|---|
  | Blush paper | `#f6dcd8` |
  | Ivory cards | `#fffefb` → `#fbf3ea` |
  | Rose (lead accent) | `#a63f5b`, deep `#7d2742` |
  | Gold, used as fine lines | `#b98b3e`, highlight `#f6deaa`, deep `#8a6424` |
  | Sage (small caps labels) | `#5d7852` |
  | Soft ink | `#45292f` / `#74535a` |

  Maroon is only a small accent.
- **Type:**

  | Font | Use |
  |---|---|
  | `--font-script` Great Vibes | names, titles |
  | `--font-display` Cinzel | small spaced caps labels, and numbers (Cormorant's old-style numerals read badly) |
  | `--font-serif` Cormorant Garamond | body, italics |
  | `--font-gurmukhi` Tiro Gurmukhi | every Punjabi line (class `gurmukhi`) |
- **Card language:** ivory paper, a thin gold outline plus a **dotted gold inner keyline**, soft rose shadows (`rgba(125,39,66,.2–.5)`), arch or onion-dome tops, gold used as hairlines not fills. Small Punjabi touches: phulkari diamond borders, diyas, lotus motifs, Gurmukhi eyebrows on every section.
- **Motion style:** GSAP timelines that play once on scroll-in (`once: true`), staggered fade-ups, names written in with a `clip-path` wipe, gold outlines drawing on (`strokeDashoffset`), gentle `back.out` pops. Always wrap in `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`.

### Reference site
**https://lotus-bloom-delta.vercel.app/** (Aarohi & Vihaan). The owner likes its *feel*: calm spacing, ivory paper cards with dashed gold keylines, stacked script names, full-screen "scenes" with torn-paper seams, an envelope, a book and a wishing wall.

Rule from the owner: **"less clone, but the feel should be the same."** Take inspiration from its spacing, card style and motion. **Never copy its layout one-to-one or its artwork.** Keep our Punjabi content and colours.

The `extract-design` skill (`.claude/skills/SKILL.md`, `npx designlang <url>`) was used once to analyse it.

## 3. Page order (`src/App.jsx`)

1. `PlaneIntro` — the night-flight intro (the `HaveliGate` door intro also exists; switch with `INTRO` in App.jsx)
2. `Hero` — sky, gurdwara walk-in (pinned scroll)
3. Inside `.blush-run` (one shared blush sheet and floral layer):
   - `Invitation` — **envelope opening**, then the onion-dome card
   - `Couple` — bride and groom arches
   - `Story` — winding thread, travelling heart, polaroids
   - `Gallery` — **"Moments" blossom doorway** (replaced the book; see §4b)
   - `Countdown` — **live Punjab clock** plus **scratch cards**
4. `Events` — the four celebrations on a brass-roller scroll, held still while the days change
5. `Venue`
6. `OurFamilies` — new
7. `FamilyWelcome` — the elders
8. `GuestNotes` — "Good to Know"
9. `Rsvp`
10. `Wishes` — "Ashirwad Wall", new
11. `Contacts` — "Get in Touch", new
12. `ThankYou` — the closing scroll; it also shows the contacts

Overlays: `MusicToggle` (dhol), `AutoTour` (hands-free slow scroll, with Pause / Resume buttons).

## 4. What was built in the last session (all committed together)

- **Plane intro greeting (`PlaneIntro.jsx`):** in Punjabi with a flight theme.
  - `ਪਿਆਰੇ {guest},` / `{familiesGurmukhi} ਵੱਲੋਂ ਨਿੱਘਾ ਸੱਦਾ` / `ਆਓ, ਜ਼ਿੰਦਗੀ ਦੇ ਸਭ ਤੋਂ ਖ਼ੂਬਸੂਰਤ ਸਫ਼ਰ ਦੀ ਉਡਾਣ ਭਰੀਏ` / "Boarding now · the journey of a lifetime with" / names.
  - **Guest name** comes from the link `?guest=Sardar+Gurpreet+Singh+ji` via `src/lib/guest.js`. The fallback is "Family & Friends". The Hero uses the same helper.
  - **Family names:** `families` in English and `familiesGurmukhi` in Gurmukhi, both in `wedding.js`.
  - The Gurmukhi was written by Claude; a native speaker should proofread it.
- **Invitation card (`Invitation.jsx/.css`):**
  - **Layout:** redesigned inside the owner's onion-dome arch. ੴ, "|| With the blessings of Waheguru ||", a lotus motif, ਜੀ ਆਇਆਂ ਨੂੰ, stacked rose script names with a gold &, a dashed gold divider with a star, the invitation paragraph, the date and the city. Sizes use `cqw`, so it scales with the card.
  - **Envelope:** the card arrives in a blush envelope with a rose wax seal "H&J". The seal breaks, the flap opens in 3D, the card glides out, the envelope melts away, the card settles, then the words animate in.
  - **Scroll hold:** the page glides to centre the envelope and **holds scrolling** (`lenis.stop()` + `html.is-locked`) until the whole animation ends, about 6.5 s. There is a 12 s fail-safe unlock. Tapping the seal opens it at once.
  - **`AutoTour.jsx` change:** the tour now **waits while `html.is-locked` is set**, so it doesn't jump ahead.
- **Moments book (`Gallery.jsx/.css`)** — *since replaced by the doorway in §4b; kept here for history:*
  - A rose-cloth book that opens, then turns one page per stretch of scroll. It is a sticky stage inside a tall track, scrubbed with GSAP.
  - Each page has a photo in an arched window, then Gurmukhi, a script title, the place, and text.
  - **Background:** the stage has its own blush paper and florals, so the background stays still. The book is up to 560px wide.
  - **Class names:** the book's classes are prefixed `bkleaf`, because `HaveliGate.css` has a global `.leaf` that clashed.
  - **Content:** in `wedding.gallery` (`photo, gurmukhi, caption, place, text`). The photos `public/photos/gallery-1..5.jpg` don't exist yet, so pages show an "H & J" placeholder.
- **Countdown (`Countdown.jsx/.css`, `PunjabClock.jsx/.css`):**
  - **Live wall clock:** in the blush theme, always showing **Amritsar (IST) time**. It has Gurmukhi numerals ੧–੧੨ and the 12 desi months between them (ਪੋਹ, ਮਾਘ, ਫੱਗਣ, ਚੇਤ, ਵੈਸਾਖ, ਜੇਠ, ਹਾੜ੍ਹ, ਸਾਵਣ, ਭਾਦੋਂ, ਅੱਸੂ, ਕੱਤਕ, ਮੱਘਰ), with a **gold shimmering map of Punjab** in the centre.
  - **Map source:** the outline comes from the Apache-2.0 dataset `github.com/Tanmay53/india-state-boundries-geojson`, simplified to about 290 points. Credit is in a code comment only.
  - **Scratch cards:** ivory arched cards, each with a brass diya, a rose number (Cinzel), a faint lotus watermark, a gold rule, sage and gold labels, and a phulkari hem. The cover is a canvas of rose petals with "Scratch".
  - **Petals:** scratching drops falling rose petals, at most 36 at once, plus a burst of 14 when a card opens.
- **New sections:**
  - `OurFamilies` (data `wedding.bothFamilies`): two arch cards with a red-gold thread knot that draws itself. **Don't rename it to `families`**: `wedding.families` is the string the intro uses, and overriding it broke the site once.
  - `Wishes`: the Ashirwad Wall, with cards pegged on a phulkari string that sway. Guest wishes are saved in localStorage only.
  - `Contacts`: arch cards with a Call button, plus WhatsApp if `whatsapp` is set. Data comes from `wedding.contacts` + `wedding.help`.
- **Placeholders still in `wedding.js`:** phone numbers (`98XXX XXXXX`), helper contacts, grandparents' names, starter wishes and gallery text are invented, so replace them with real ones.

## 4b. Moments doorway (session of 17 Nov 2026, not committed yet)

The owner asked for something instead of the book. Ideas offered: jharokha windows, polaroids on a string, a timeline path. They picked the jharokha, then steered it step by step to the final design below.

**Final design (`Gallery.jsx`, `Gallery.css`):**
- **Artwork:** the owner's own image of a **pink double door, wide open**, in an arch wreathed with gold scrollwork and cherry blossoms, on marble steps. It is `public/door/door-open.webp` (900×1350, transparent).
  - The source image they sent had a fake checkerboard "transparency" painted in. It was removed with a flood-fill script (Pillow + scipy in a scratch venv), and the doorway was cut out.
  - The doorway sits at about **30–70% across and 27–86% down** the artwork. The photo pane `.jh__pane` is placed behind the image there.
  - A closed-door image was also supplied, but the owner **didn't want the gate opening/closing animation**, so it was dropped (`door-closed.webp` was deleted).
- **Layout:**
  - **Phones / narrow (<1100px):** door centred and as big as the width allows, with the caption, dots and hashtag **below** it. Never put the caption over the photo; the owner disliked that lower-third overlay.
  - **Wide (≥1100px):** a 3-column grid with the door centred and nearly full height. The left column holds the **story caption** (right-aligned, with a gold divider). The right column holds a **big gold script number "02 of 05"**, vertical dots and the hashtag. The gallery's florals are pushed outward (`img width:132%`) so the side text stays clear. Every grid item needs an explicit `grid-row: 1`; without it, auto-placement drops the caption to row 2.
  - Note: on desktop the real site renders inside a **phone-frame iframe** (`DesktopFrame`, `?embed=1`), which is what the owner usually looks at. `?full` shows the full-width layout.
- **Behaviour (final, after several failed attempts):**
  - The track is just `100svh`, so there is **no scroll-scrubbing**.
  - When the section's top crosses **35% of the viewport going down**, `open()` runs. It glides the section to the top with Lenis (`scrollTo … onComplete`), then holds the page: `lenis.stop()`, `html.is-locked`, and a `scroll` listener that puts the page back if anything moves it.
  - **Photos play on a timer:** each one is a ~0.9 s timed GSAP slide. The new photo slides over the old one from below and settles from a 1.08 zoom, and the old photo drifts up 14%. The caption swaps after the photo lands. Each photo holds for `HOLD = 2.6 s`.
  - **Input:** wheel down / swipe up / arrow keys bring the next photo sooner, through **GSAP `Observer`** (registered in `src/lib/gsap.js`). A 1.2 s gesture cooldown means momentum can't skip photos.
  - **Release:** about 1.8 s after photo 5 the page unlocks, or at once on a further swipe down. Swiping up on photo 1 also releases. There is a fail-safe release after about 30 s.
  - The AutoTour already waits while `html.is-locked` is set, so it pauses here and continues afterwards.
  - **After the first pass:** the dots (now `<button>`s) and tapping the doorway show any photo, without locking.
  - **Reduced motion:** a plain list of arched photos (`.jh__list`).
- **What the owner rejected, so don't bring these back:**
  - The SVG / CSS hand-drawn jharokha and door.
  - Shutters swinging per photo.
  - Iris / blurred-circle reveals.
  - Feathered mask wipes (they looked ghosted).
  - Scroll-scrubbed photo changes clamped by scroll position (they froze mid-slide and felt jerky).
- **`.gallery__paper` / `edgeIn` / `edgeOut`:** another edit added a still paper layer whose top and bottom edges (`--gt`, `--gb`) fade into the page florals as the section slides in and out. It is driven by two scrubbed tweens in `Gallery.jsx`. Keep them when editing.
- **Still to check:** smoothness on a real phone (only checked in a hidden preview pane, where animations are throttled), and how the auto tour behaves at the doorway.

## 5. Known gaps / ideas not done yet

- Not tested on a real phone. Only a ~650px browser window was tried.
- No real photos yet: `public/photos/` for bride, groom, story, gallery and family.
- Torn-paper seams between sections, and re-doing Events / Family as full reference-style scenes, were tried once and **reverted at the owner's request**. Redo them only if asked, and in the blush theme.
- `IMAGE-PROMPTS.md` (repo root, uncommitted) has Nano Banana prompts from an earlier attempt. Nano Banana makes one image per prompt and can't output transparency (generate on white, remove the background, save as PNG). Those prompts were written before the theme was clarified, so update them before reuse.
- A 500 error for one resource appears in the dev console. It was never traced and is probably a missing photo.
- `src/components/PlaneIntro.jsx-E` is a stray backup file left by a `sed -i -E` command. It can be deleted.

## 6. How the owner likes to work

- **Section by section:** they review one section at a time from screenshots and ask for changes.
- **Look before building:** look at the **live site in the browser** before assuming anything about the theme or a section.
- **Animation is wanted** on everything new, but it must be smooth (no snapping or z-index jumps) and must not fight scrolling.
- **Language:** Punjabi / Gurmukhi touches are welcome. Ask a native speaker to proofread new Gurmukhi.
- **Variables:** keep anything that changes per guest or per family in `wedding.js` (guest name from the URL, family names).
- **Verify before reporting:** check changes in the browser (`npm run dev`, port 5173). If a section seems "not working", first check whether `AutoTour` or the envelope scroll-lock is involved.
- **Scroll-holding sections:** sections that hold the page (envelope, Punjab clock, Moments doorway) all use the same pattern: glide into place, `lenis.stop()` + `html.is-locked`, timed GSAP animation, release, and a fail-safe. Prefer this over clamping the scroll position.
- **Testing tips (from the Moments session):**
  - **Hidden preview pane:** when the Claude browser pane is hidden, `requestAnimationFrame` and scroll events are throttled, so GSAP timers and Lenis barely run. Take screenshots between waits to push frames through, or show the pane.
  - **Lenis fights scripted scrolls:** pause the AutoTour first (click "Pause"), and re-measure positions after each scroll because the layout keeps shifting.
  - **Scripted scrolls can trigger other sections:** a forced scroll past the Punjab clock fires its own lock and release, which also clears the gallery's lock.
- **Testing tips:** the intro locks the page until "Take off" is pressed. In scripts, add `?notour` to the URL to stop the auto-tour. Removing `html.is-locked` lets you scroll. Scripted `window.scrollTo` doesn't fire Lenis/ScrollTrigger updates, so call `ScrollTrigger.update()` (import from `/src/lib/gsap.js`).
