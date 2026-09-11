---
name: Geekoach
description: Carte de cartographe en cours de relevé — le suivi de poids et de séances tracé comme une exploration de Hallownest.
colors:
  ink-950: "#313842"
  ink-900: "#373f4b"
  ink-850: "#3b4553"
  ink-800: "#404b5a"
  line: "rgba(226, 232, 240, 0.11)"
  line-strong: "rgba(226, 232, 240, 0.18)"
  fg: "#e6ebf2"
  fg-muted: "#9ba5b4"
  fg-faint: "#5b6576"
  cyan: "#a7e6ee"
  cyan-dim: "#6fa8b3"
  cyan-glow: "rgba(167, 230, 238, 0.28)"
  amber: "#d9b56a"
typography:
  display:
    fontFamily: "Cinzel, serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "normal"
  label:
    fontFamily: "Cinzel, serif"
    fontSize: "0.6rem-0.65rem"
    fontWeight: 600
    letterSpacing: "0.14em"
    fontFeature: "uppercase"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "24px"
  lg: "40px"
components:
  button-primary:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.cyan}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.cyan}"
  region-panel:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
    padding: "24px 32px"
  input:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
    padding: "10px 12px"
---

# Design System: Geekoach

## Overview

**Creative North Star: "The Cartographer's Map of Hallownest"**

Geekoach reads as a hand-surveyed map, not a fitness dashboard. The world is a patinated slate-blue field, engraved with thin hairlines rather than boxed cards, where a single pale-cyan halo stands in for a lamp held over unfinished territory. Regions of the map — Profil, Poids, Séances, Quêtes, Coach — are either surveyed (rendered with real data and a hairline border) or still under mist (rendered as a dashed-border placeholder with muted, honest language: "Région sous la brume"). Nothing fakes completion; an unsurveyed region says so.

Typography carries the cartographer voice: Cinzel in tight, wide-spaced small caps for numerals, region titles, and labels (the ink of hand-lettered map legends), Inter for every sentence of running text and data (legible, modern, never decorative). The pairing is deliberately asymmetric — display/label is ornamental and rare, body is plain and load-bearing.

The system rejects near-black "app" darkness (the comp and the shipped build both land on a lived-in slate-blue, `#313842`, not `#0a0a0a`) and rejects dashboard chrome — no card-shadow elevation, no icon-driven nav, no colored status chips. Depth comes from a single radial cyan glow at the top of the page and from border hairlines at two opacities, never from shadow.

**Key Characteristics:**
- Slate-blue ink field with a single pale-cyan accent, used sparingly (links, active states, chart line, focus rings)
- Cinzel small-caps for all labels/numerals/headings; Inter for all body and data
- Regions are hairline-bordered panels or dashed-border "mist" placeholders — never rounded cards
- Sharp corners everywhere (`border-radius: 0`); the only circular forms are the sealed-region badge and the scrollbar thumb
- A numbered seal (double-ring, roman numeral) marks a region as complete, not a checkmark or a colored badge

## Colors

The palette is a narrow, low-chroma slate-blue ramp lit by one accent; nothing else is permitted to carry color.

### Primary
- **Mist Cyan** (`#a7e6ee`): the single accent. Used for the weight trend line in Recharts, active tab underlines/text, hover states on links and buttons, focus-visible outlines, and the sealed-region badge glyph. Never used as a fill for large surfaces.
- **Dim Cyan** (`#6fa8b3`): the accent's quiet register — button borders at rest, active period-filter borders, the sealed badge's outer ring.
- **Cyan Glow** (`rgba(167,230,238,0.28)`): text selection background and the ambient radial glow at the top of the page. Not used as a solid fill.

### Neutral
- **Slate Ink** (`#313842`): the page background (`body`). This is the patinated "ground" of the map — deliberately slate-blue, not near-black; raised from an earlier near-black draft during finish review to match the approved comp.
- **Panel Ink** (`#373f4b`): region-panel and section background, always at `60%` opacity over the page ground (`bg-ink-900/60`).
- **Tooltip Ink** (`#3b4553`): Recharts tooltip background, the one place a solid (non-transparent) panel tone is used.
- **Field Ink** (`#404b5a`): reserved for the darkest surface step (scrollbar track/thumb border); not used as a component background.
- **Foreground** (`#e6ebf2`): primary text and data values (weight numbers, headline figures).
- **Muted Foreground** (`#9ba5b4`): secondary text, labels, dates, meta lines, muted chart ticks.
- **Faint Foreground** (`#5b6576`): the quietest text step — reference-line strokes (goal-weight dashed line on the weight chart).
- **Hairline** (`rgba(226,232,240,0.11)`) and **Hairline Strong** (`rgba(226,232,240,0.18)`): the two border-opacity steps. Hairline is the default border for every panel, divider, and input; Hairline Strong marks emphasis (e.g. active/focused states, tooltip border).

An amber token (`#d9b56a`) is declared in `globals.css` but not yet consumed anywhere in the built pages — it is not a documented system color until a component actually uses it.

### Named Rules
**The One Halo Rule.** Color is scarce: cyan appears only as accent (line, link, active state, focus ring, seal), never as a background fill. Every surface is slate-blue-on-slate-blue; the accent's rarity is what makes it read as a lamp, not a UI color.

## Typography

**Display Font:** Cinzel (with serif fallback)
**Body Font:** Inter (with system-ui, sans-serif fallback)

**Character:** Cinzel supplies the map's engraved, lapidary voice — always in small caps, always tracked wide, never used for a full sentence. Inter carries every actual sentence and every number, so the map stays legible under the atmosphere.

### Hierarchy
- **Display** (weight 600, `text-4xl`–`text-5xl` / `~2.25–3rem`, tight line-height): page-level headline ("Carte de Progression") and the large current-value figures (current weight in kg). Rendered in Cinzel via `font-[family-name:var(--font-display)]`, sentence case, not uppercase.
- **Title** (weight 500–600, `text-3xl`–`text-4xl`): page-header title on detail pages ("II · Poids"), same Cinzel display face.
- **Body** (weight 400, `text-sm`/`0.875rem`, line-height ~1.5): all running text, list items, history rows, form values.
- **Label** (weight 600, `0.6rem`–`0.65rem`, letter-spacing `0.14em`, uppercase): the `.tracked` utility — region numerals/titles, meta text, field labels, button text, chart tick labels' surrounding chrome, period-filter tabs. This is the single most reused typographic pattern in the build.

### Named Rules
**The Tracked-Label Rule.** Any Cinzel usage below headline size is always uppercase, always letter-spaced at `0.14em` via the shared `.tracked` class — never a bare small caption. Small text is either plain Inter body copy or a tracked Cinzel label; there is no intermediate style.

## Layout

Single-column, content-first layout capped at `max-w-3xl`, centered with horizontal padding that steps from `px-6` (mobile) to `px-10` (`sm:`). There is no sidebar and no multi-column dashboard grid — the home page is a vertical stack of region panels (`flex flex-col gap-5`), read top to bottom like a scroll through a map's legend, numbered with roman numerals (I–VI) that stay stable across the home dashboard and each region's own detail page.

Detail pages (`/poids`, `/seances`) repeat one shape: a `PageHeader` (numeral, title, back-link, optional meta) full-bleed with a bottom hairline, followed by the same `max-w-3xl` centered column holding, in order: current-value summary, a period-filter tab row (bordered tabs, no pills), a chart panel, an entry form panel, and a divided history list. Vertical rhythm between major sections is `gap-10`; within a panel, `py-6`/`px-6` (`sm:px-8`).

Panels never round their corners and never nest shadows; the only depth cue at layout scale is the radial cyan glow fixed at the top of the viewport (`body` background) and the hairline borders that separate regions.

## Elevation & Depth

Flat by design. There are no box-shadows anywhere in the built components — depth is conveyed by two devices only: a single ambient radial-gradient glow (cyan, 5% opacity, fixed near the top of the page) that stands in for atmospheric light, and a two-step hairline border system (`--line` at 11% opacity for default separators, `--line-strong` at 18% for emphasis). Panels sit on a semi-transparent tint of the page ground (`bg-ink-900/60`) rather than a lifted surface color.

### Named Rules
**The No-Shadow Rule.** Nothing casts a shadow. Separation between surfaces is drawn with a hairline border or a translucent background tint, never `box-shadow`. This is a hairline-and-glow world, not a lifted-card world.

## Shapes

Every corner in the built system is square (`border-radius: 0`, enforced via `rounded-none` on inputs and by omitting radius elsewhere). The two exceptions are deliberate and narrow: the scrollbar thumb (`border-radius: 999px`, a track detail, not a UI component) and the sealed-region badge, which is the system's one circular, double-ring construction — an outer solid-border circle (`border-cyan-dim/60`) containing an inner dashed-border circle (`border-dashed border-cyan-dim/50`) holding the region's roman numeral. This double ring is a deliberate seal/stamp motif, distinct from any badge/chip vocabulary, and it is the only place circles and dashed strokes combine.

Dashed borders otherwise mark absence, not completion: the "mist region" placeholder uses a full dashed border (`border-dashed border-line`) to signal an unsurveyed area, and the weight chart's goal-line reference uses a dashed stroke for the same reason — dashes mean "not yet solid."

## Components

### Buttons
- **Shape:** square corners (`rounded-none`, i.e. `0px`), single hairline border.
- **Primary (only variant in use):** `border-cyan-dim/50`, `bg-cyan/10`, `text-cyan`, tracked Cinzel label text, padding `px-5 py-2.5`. There is no filled/solid button anywhere in the build — every button is this low-fill, bordered "sealed permit" treatment.
- **Hover / Focus:** border brightens to full `cyan` and fill deepens to `bg-cyan/20` on hover; `:focus-visible` gets a 1.5px cyan outline with 3px offset, defined globally, not per-component.

### Cards / Containers (Region Panels)
- **Corner Style:** square (no radius).
- **Background:** `ink-900` at 60% opacity over the page ground; header and footer strips inside a panel are separated from the body by hairline borders, not by a different fill.
- **Shadow Strategy:** none — see Elevation & Depth.
- **Border:** single hairline (`--line`) on all sides.
- **Internal Padding:** `px-6 py-4` for header/footer strips, `px-6 py-6` for body (`sm:px-8`).
- **Signature state — Sealed Region:** when a region panel's footer carries a `sealedNote`, it renders the double-ring numeral badge plus a tracked "Région scellée" label in cyan. This is the build's one bespoke status indicator; it replaced an earlier flat-badge draft during finish review specifically to avoid reading as a generic UI chip.

### Mist Region (signature component)
The placeholder state for a not-yet-surveyed region: a dashed hairline border, centered text, tracked numeral/title line, and an italicized-in-spirit (not literally italic) "Région sous la brume" line in muted foreground, followed by a short explanatory note. This is the system's honesty device — it never simulates data or progress for a region that has none.

### Inputs / Fields
- **Style:** square corners, `border-line` hairline, `bg-ink-950/60` fill (darker than the panel it sits in), `text-fg` value text, `placeholder:text-fg-muted`.
- **Focus:** border shifts to `cyan-dim` on focus (no glow, no shadow) — a quieter, component-local echo of the global focus-visible ring.
- **Labels:** every field is preceded by a tracked Cinzel label, never a placeholder-only field.

### Navigation
- Top-of-page "&larr; Retour à la carte" back-link on every detail page, tracked Cinzel label style, muted by default, brightening to cyan on hover.
- Period filters (7/30/90 jours, semaines, "Tout") render as a hairline-bordered tab row: inactive tabs are transparent-bordered muted text, the active tab gets a `border-cyan-dim` bottom-anchored border and `text-cyan`. No pill-shaped or background-filled tab state exists.

### Charts (Recharts)
- Weight line: 1.5px cyan stroke, no visible dots at rest, a 3px cyan dot only on hover (`activeDot`).
- Goal-weight reference line: dashed, `fg-faint` stroke, 1px — the chart's only dashed data element, consistent with dashes-mean-incomplete/aspirational elsewhere in the system.
- Tooltip: square corners, `ink-850` solid background, `line-strong` border, muted label text, cyan value text.
- Axis ticks: muted foreground, no axis line on the Y-axis, hairline axis line on the X-axis when shown; the compact home-dashboard chart hides axes entirely and only shows the line and goal reference.

## Do's and Don'ts

### Do:
- **Do** keep every corner square (`border-radius: 0`) except the sealed-region badge and the scrollbar thumb, which are the system's only confirmed circular forms.
- **Do** reserve cyan for accent roles only (line, link, active tab, focus ring, chart line, seal) — never as a panel or button fill above 20% opacity.
- **Do** render an unsurveyed region as a dashed-border "mist" placeholder with plain language about what's missing, rather than an empty chart or a fabricated zero-state metric.
- **Do** pair every Cinzel usage with the tracked/uppercase/`0.14em` treatment; Inter carries all sentence-case text.
- **Do** use the double-ring numeral badge for "sealed/complete" states; it is the system's one status-indicator shape.

### Don't:
- **Don't** add box-shadows or lifted-card elevation; depth comes only from the single radial glow and the two-step hairline border system.
- **Don't** introduce kicker/eyebrow labels above headings — the craft floor bans this device project-wide, and it was removed from this build during finish review; it is not a pattern to revive on future surfaces.
- **Don't** darken the page ground toward near-black; the slate-blue ink (`#313842`) is the confirmed ground color, corrected up from an earlier near-black draft to match the approved comp.
- **Don't** use a filled/solid button; every button in the system is the low-fill bordered treatment (`bg-cyan/10` at rest).
- **Don't** invent a colored status chip or badge for "complete" states; use the double-ring seal instead.
