---
name: clipboard-design
description: Use this skill to generate well-branded interfaces and assets for Clipboard (a visual AI agent orchestration platform for business operators), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation for agents

- **Brand name is always lowercase: `clipboard`.** Never `Clipboard`, never `CLIPBOARD`.
- **Navy #12192B dominates every major surface.** The three accents (Yellow #F6C94E, Violet #7B52E8, Teal #2BBFAD) are supporting cast — one per component, never all three at equal weight.
- **Typography:** Bricolage Grotesque (display, tight tracking), DM Sans (body), DM Mono (labels, UPPERCASE, wide tracking).
- **Radius:** 10–14px for UI, 16px for marketing cards. Never 0, never 20+.
- **No emoji. No Unicode-as-icon. No gradient surfaces. No hand-drawn SVG.** Use the Lucide-style icons in `preview/iconography.html` as the reference pattern.
- **Tone:** confident operator. Direct, warm, results-focused. See `README.md` → CONTENT FUNDAMENTALS for the write-this/not-this examples.

## Where to start

1. `colors_and_type.css` — drop-in CSS custom properties. Link it first.
2. `assets/` — SVG logos (light, dark, mark-only, wordmark, stripe motif). Reference these directly; do not redraw.
3. `ui_kits/app/` and `ui_kits/marketing/` — reference implementations. The shared React primitives live in `ui_kits/shared.jsx` (CBMark, CBLogo, Icon, Pill, Button).
4. `preview/` — small demonstration cards for each token/component. Use them as ground truth for colors, pills, agent cards, voice.
