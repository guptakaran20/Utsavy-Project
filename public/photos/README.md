# Photo slots

Every photo on the site is described in `src/data/wedding.js` as `photo: '<path or URL>'`, plus an optional
`focus: 'x% y%'` (the part of the picture to keep when it has to be cropped).

Because every frame (arches, polaroids, round elder portraits, the book's windows) fills itself with
`object-fit: cover`, **any size or aspect ratio works**: pictures are cropped to the frame, never stretched.
Later the same `photo` / `focus` fields can simply be filled from a backend/CMS response, with full URLs.
A missing or broken picture falls back to the decorative monogram.

| Where | Data field | Frame |
|---|---|---|
| Couple section | `bride.photo`, `groom.photo` | tall arches (5:7) |
| Our Story | `story[i].photo` | polaroid windows |
| Moments book | `gallery[i].photo` | arched window on each page |
| Family welcome | `family.elders[i].photo` | round portraits |

Aim for ~1200–1400 px on the long side, JPG/WebP, under ~400 KB.

## Current pictures are stand-ins

Free-licence stock photos (Pexels licence, no attribution required) so the layout can be judged. Replace them with the
couple's own photos. Sources are listed in `CREDITS.md`.
