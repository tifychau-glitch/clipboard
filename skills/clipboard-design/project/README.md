# Clipboard Design System

**Tagline:** Your business, handled.

Clipboard is a visual, no-code AI orchestration platform for business operators — especially in real estate (TC firms, creative finance). It packages AI agent teams into pre-built, niche-specific templates so a non-technical business owner can deploy an entire back-office in clicks, not code.

The product sits deliberately apart from developer-focused tools like paperclip-style orchestration frameworks. Where those are built for engineers, Clipboard is built for operators. The brand work leans into that distinction at every level: lowercase wordmark, plain-spoken copy, visual UI instead of YAML, and a checkmark that says *done. handled. complete.*

## Sources

The system in this project was synthesized from two pieces of provided material plus a referenced repo:

- `uploads/clipboard-brand-final.jsx` — final brand direction, built as a single React component. Source of truth for logo SVG, color values, sample UI compositions (sidebar, agent card, buttons, voice blocks).
- `uploads/clipboard-brand-guidelines.docx` → extracted to `uploads/brand-guidelines.txt`. Source of truth for voice, tone, logo rules, do/don't matrices, the meaning of each accent color, and writing examples.
- `github.com/tifychau-glitch/paperclip` (default branch: `master`) — an open-source multi-agent orchestration framework. **Clipboard is explicitly positioned as "not a paperclip clone"** — this repo is listed for reference only. Nothing was imported from it; the brand guidelines instruct us to be the visual, business-first antithesis of developer orchestration tools.

## Index

- `README.md` — this file. High-level brand, content, visual and iconography guidelines.
- `SKILL.md` — Claude-invocable skill manifest. Entry point when this system is used as an Agent Skill.
- `colors_and_type.css` — CSS custom properties for colors, fonts, type scale, spacing, radii, shadows. Start here when coding.
- `assets/` — logo SVGs (light, dark, mark-only, wordmark lockup) and the three-stripe motif.
- `fonts/` — note only. Fonts are loaded from Google Fonts via `colors_and_type.css`; no font files are bundled.
- `preview/` — the cards shown in the Design System tab. Small, focused demonstrations of one concept each.
- `ui_kits/app/` — Clipboard web app UI kit: sidebar, agent list, agent detail, templates picker, composer.
- `ui_kits/marketing/` — Clipboard marketing site UI kit: hero, features, pricing, CTA bands.

## CONTENT FUNDAMENTALS

### Voice in one line
A confident operator, not a tech startup. Direct, warm, results-focused. Respect the reader's time.

### Casing
- **Brand name is always lowercase:** `clipboard` — never `Clipboard`, never `CLIPBOARD`. The exception is the first word of a sentence, where it is still written lowercase (`clipboard runs your back office`). UI labels and nav items follow standard sentence case.
- **Button and nav labels use sentence case** ("Get started free", "My agents", "New agent"). Not Title Case, not ALL CAPS. The exception is the DM Mono label style, which is UPPERCASE with wide tracking — reserved for metadata, status badges, section eyebrows.

### Person
- **You** (reader) and **we** (Clipboard) are both used, but "you" carries the weight. "Your business, handled." "Agents that run your back office." We rarely say "our customers" — we say "you."
- Product-as-subject is preferred over feature-as-subject. *"Clipboard sends the follow-up"* over *"A follow-up workflow is configured that then executes."*

### Writing principles (from the guidelines)
1. **Say what it does.** Short, declarative. `Your business, handled.` is the whole thesis in three words.
2. **No jargon.** Never "leverage", "orchestration platform", "multi-agent workflows", "AI-powered". If the reader could guess you wrote this with a thesaurus open, rewrite it.
3. **Checkmark language.** The logo has a checkmark; the copy should reinforce it. Use `Handled.` `Done.` `Contract sent.` `Follow-up complete.` `Task closed.` as micro-affirmations in toasts, success states, row endings.
4. **Concrete numbers beat adjectives.** `14 tasks complete` not `Successfully processed a large volume of workflow items`. `2m ago` not `recently`.
5. **No em-dash clickbait hooks, no hype.** Skip "The future of...", "Introducing the world's first...", "Revolutionary...".

### Good vs. bad (from the guidelines, verbatim)
| Write this | Not this |
|---|---|
| Your business, handled. | Experience the future of AI-powered automation. |
| Get started free | Begin your journey today |
| Agents that run your back office | Leverage intelligent multi-agent orchestration |
| No engineers needed | No technical expertise required whatsoever |
| 14 tasks complete | Successfully processed 14 workflow items |

### Emoji & ornaments
- **No emoji.** Not in UI, not in marketing. The guidelines explicitly exclude "smiley faces, hearts, or cute illustrations."
- **No exclamation points** except in genuine success toasts (`Contract sent!` is fine; `Welcome to Clipboard!` is not).
- The **three-stripe motif** (yellow | teal | violet, equal widths) is the one piece of decoration this brand has. It belongs to the logo and intentional brand moments only. Never use it as a generic divider.

## VISUAL FOUNDATIONS

### Color (see `colors_and_type.css`)
- **Navy #12192B dominates.** It is the largest surface in any composition — sidebars, hero bands, footers, app chrome. White space around navy is what makes the accents pop.
- **Three logo accents, one per section.** Yellow = contracts, tasks, energy, CTAs. Violet = agents, automation, product intelligence. Teal = live, active, success. Do not stack all three at equal weight in one component.
- **Highest-contrast CTA pairings:** yellow text/fill on navy, violet fill with white text on light surfaces.
- **Soft tints** (`--cb-*-tint`) are for pill backgrounds. Never tile them, never use them as section backgrounds.
- **Never:** yellow text on white (contrast fail), violet as a large background, all three accents mixed in one card.

### Type
- **Bricolage Grotesque** — display only. 800 for H1, 700 for H2, 600 for H3 and UI labels. Always tracked tight (`-0.02em` to `-0.035em`).
- **DM Sans** — body. 300 for hero supporting copy, 400 for standard paragraph, 500 for emphasis. Line-height 1.65–1.7 (breathing room matters).
- **DM Mono** — labels and metadata only. 10–11px, UPPERCASE, letter-spacing 0.10–0.18em. Never headlines.
- **Hierarchy is dramatic.** H1 → body is a big jump (48–64px → 14–15px). Operators scan; clarity wins.

### Spacing
- 4px base. Generous gaps: 44–60px between major sections on marketing, 24–32px between cards in app.
- **White space is doing work.** The contrast between dense navy and open light content is the polish.

### Corners
- **10–14px** for cards, buttons, inputs. Modern, professional, not cute.
- **16px** for primary marketing cards.
- **Never 0px** (reads aggressive), **never 20px+** on UI (reads childish). 20px+ is allowed only on marketing showcase surfaces.

### Backgrounds
- **Flat navy slabs with subtle grid** for hero/section bands (see hero in `clipboard-brand-final.jsx`: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)` at 48px intervals, both axes).
- **Soft blurred color blobs** — yellow, violet, teal — at 10–12% opacity behind the hero, heavily blurred (50–60px). Subtle glow, never dominant.
- **White or `#F5F6FA` surface** for content areas.
- **No full-bleed photography, no repeating patterns, no hand-drawn illustrations, no gradient surfaces.** The brand avoids consumer-app decoration.

### Borders & shadows
- **Border:** `1px solid #E8EAF0` on cards over light bg. On navy, use `rgba(255,255,255,0.05)`.
- **Shadows are soft and rare.** Default card has NO shadow — just a border. Hover on interactive rows/cards lifts a small shadow `0 4px 14px rgba(18,25,43,0.08)`. Popovers and menus get a larger `0 12px 28px rgba(18,25,43,0.14)`.
- No inner shadows. No glow. Focus ring is `0 0 0 3px rgba(123,82,232,0.25)` (violet at 25%).

### Motion
- **Fast and restrained.** 150ms for hovers and button states, 250ms for entering elements, 400ms for hero fade-ins.
- **Easing:** `cubic-bezier(0.2, 0.7, 0.2, 1)` — soft out-curve. No bounce, no spring, no elastic. The brand is reliable, not playful.
- **Pattern:** "up" reveal (opacity 0 → 1, translateY 18px → 0, 600ms) is used for stagger-loading hero sections. Use sparingly.

### Hover / press states
- **Buttons:** subtle `translateY(-1px)` on hover, background darkens (navy → `#1e2d4a`) or opacity drops to 0.88 (violet). No scale.
- **Cards / rows:** shadow appears on hover (no transform).
- **Press:** no explicit shrink or active treatment in the source. Keep it simple — rely on the browser default active state.
- **Links:** underline on hover only. Color does not change.

### Transparency & blur
- **Backdrop blur is not part of the system.** No frosted glass.
- **Alpha is used for hierarchy on navy:** white at 1.0 / 0.5 / 0.3 / 0.08 for the four levels (primary text / secondary / tertiary / hairline).
- **Blur is used only for the hero color blobs.**

### Imagery tone (if / when added)
The system as supplied has no photography. If imagery is added later, it should be: cool, desaturated, minimally styled product photography on white; no warm filters; no grain; no lifestyle-bro stock. Screenshots of the product itself are preferred over stock.

### Layout rules
- **Max content width** around 1200–1280px for marketing; the app is fluid.
- **App chrome:** navy sidebar ~210–240px wide on desktop, light content panel to the right.
- **Sticky elements** are rare. The nav does not float by default.
- **The checkmark is a brand moment.** If a layout calls for an icon to celebrate completion, it's the logo's checkmark shape — not a generic ✓.

## ICONOGRAPHY

Clipboard's icon approach is **simple, stroke-based, navy or monochrome**. See `ICONOGRAPHY` details below and in `assets/` for the logo set.

- **Primary icon set:** [Lucide](https://lucide.dev) via CDN (`https://cdn.jsdelivr.net/npm/lucide@latest`) — the source material did not ship an icon set, so Lucide is chosen because its stroke weight (2px), rounded line caps, and geometric shapes match the logo's aesthetic. **This is a substitution — flagged for user confirmation.**
- **Stroke weight:** 1.75–2px. Rounded caps. 24px canvas default.
- **Color:** navy (`--cb-navy`) for default UI icons; white for icons on navy; accent colors ONLY for status/category indicators (yellow for contracts, violet for agents, teal for live).
- **Never:** multicolor icons, gradient fills, emoji, Unicode characters as icons (e.g. no `★`, no `→` glyph — use an SVG arrow).
- **Logos & marks** live in `assets/` as SVG:
  - `logo-light.svg` — full lockup for white backgrounds
  - `logo-dark.svg` — full lockup for navy backgrounds
  - `mark-only.svg` — the clipboard-with-checkmark mark alone
  - `wordmark.svg` — the word `clipboard` alone
  - `stripe-motif.svg` — the three-stripe brand moment (yellow | teal | violet)
- **Emoji: no.** Unicode-as-icon: no. SVG or nothing.

---

## Quick links
- [`colors_and_type.css`](./colors_and_type.css) — tokens
- [`ui_kits/app/index.html`](./ui_kits/app/index.html) — app UI kit demo
- [`ui_kits/marketing/index.html`](./ui_kits/marketing/index.html) — marketing site UI kit demo
- [`SKILL.md`](./SKILL.md) — skill manifest for Claude Code / Agent Skills
