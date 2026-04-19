# Clipboard

The simple, custom UI built on top of Paperclip's backend. Currently in active
development — has bugs and missing screens.

## Open in browser

http://127.0.0.1:3100

## Start

```bash
cd ~/Downloads/paperclip-claude
pnpm dev
```

That's it. The embedded Postgres comes up automatically. Hot-reload is on, so
edits to the UI in `ui/src/` show up instantly.

## Stop

`Ctrl+C` in the terminal where it's running.

## Data location

`~/.paperclip/instances/default/`

- `db/` — embedded Postgres data (companies, agents, runs, etc.)
- `companies/` — per-agent instructions files
- `logs/` — server logs

## Sister project

**Paperclip Copy** lives at `~/Downloads/paperclip-copy/` and runs on a
different port (3101) with its own data dir, so the two never collide.
