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
   - `Gallery` — **"Moments" book**
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
- **Moments book (`Gallery.jsx/.css`):**
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
- **Testing tips:** the intro locks the page until "Take off" is pressed. In scripts, add `?notour` to the URL to stop the auto-tour. Removing `html.is-locked` lets you scroll. Scripted `window.scrollTo` doesn't fire Lenis/ScrollTrigger updates, so call `ScrollTrigger.update()` (import from `/src/lib/gsap.js`).
