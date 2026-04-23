# Clipboard App UI Kit

Click-through hi-fi recreation of the Clipboard product interface. Not production code — cosmetic only.

## Files
- `index.html` — entry point. Renders a shell with sidebar + main panel. Defaults to the "My agents" screen. Clicking an agent opens its detail view.
- `components.jsx` — shell: `Sidebar`, `TopBar`, `AgentRow`, `AgentDetail`
- `screens.jsx` — screens: `AgentsScreen`, `TemplatesScreen`, `DashboardScreen`
- `../shared.jsx` — `CBMark`, `CBLogo`, `Icon`, `I` (icon set), `Pill`, `Button`

## Screens included
- **Dashboard** — 4 stat cards + activity feed + "Sunday pulse" CTA surface
- **My agents** — filterable list of agents with live/paused status
- **Agent detail** — run timeline + draft preview + approve/edit CTAs
- **Templates** — 6 pre-built agent templates in a 3-column grid
- Settings / Deals / Reports — stubs

## Interactions
- Sidebar nav switches the main view
- Tab filter on My agents (All / Running / Paused)
- Click any agent row → detail view → back link returns to list
