# Clipboard

**AI tools are everywhere. Clipboard is where solopreneurs put them together. One hub, pre-built agents, zero code.**

<br/>

## What is Clipboard?

Clipboard is a control panel for running a small team of AI agents. If you're a solo operator with three to seven agents handling different parts of your business (research, outreach, content, bookkeeping, whatever), Clipboard is where you wire them up, watch them work, set their limits, and steer.

It's not a chatbot. It's not an agent framework. It's the layer that turns a pile of agents into something you can actually run.

<br/>

## Who this is for

You'll feel the fit if you:

- Run your own business and want leverage, not headcount
- Have two or more AI agents you're already using ad hoc (Claude Code, Codex, Cursor, custom scripts)
- Lose track of what each agent did, said, or cost
- Want them to keep running without you babysitting every step
- Would rather set limits up front than get surprise bills

If you're a larger org managing twenty agents with a platform team, Clipboard isn't for you. Check out [Paperclip](https://github.com/paperclipai/paperclip), which is what Clipboard is built on.

<br/>

## What you get

- **One dashboard for all your agents.** See what each one is doing right now, what it said last, what it cost this month.
- **Pre-built agent templates.** Plug in a ready-made set of three to seven agents built for a specific job. No stitching required.
- **Guardrails built in.** Budgets per agent, approval gates for anything that touches customers or money, automatic shutoff when limits hit.
- **Memory that sticks.** Agents remember context across sessions so you're not re-briefing them every time.
- **Works with what you already use.** Claude Code, Codex, Cursor, Bash. If it can run, it fits.

<br/>

## Quickstart

Open source. Self-hosted. Runs on your machine.

```bash
git clone https://github.com/tifychau-glitch/paperclip.git clipboard
cd clipboard
pnpm install
pnpm dev
```

Then open [http://127.0.0.1:3100](http://127.0.0.1:3100).

The embedded Postgres comes up automatically. No database setup.

> **Requirements:** Node.js 20+, pnpm 9.15+

<br/>

## Templates

Every template is a ready-to-run set of three to seven agents with prompts, guardrails, and playbooks already wired. Download, load, go.

Templates in progress:
- **Follow-Up Engine** — researcher, strategist, writer, sender, triager. More niche packs coming.

<br/>

## Development

```bash
pnpm dev              # API + UI with hot reload
pnpm dev:once         # API + UI without file watching
pnpm dev:server       # Server only
pnpm build            # Build all
pnpm typecheck        # Type checking
pnpm test             # Vitest
pnpm test:e2e         # Playwright
pnpm db:generate      # Generate DB migration
pnpm db:migrate       # Apply migrations
```

See [doc/DEVELOPING.md](doc/DEVELOPING.md) for the full guide.

<br/>

## Built on Paperclip

Clipboard is a fork of [Paperclip](https://github.com/paperclipai/paperclip), tuned for solopreneurs instead of large orgs. Paperclip handles the hard orchestration details under the hood: atomic task checkout, budget enforcement, persistent agent state, governance with rollback, true multi-tenant isolation. Clipboard keeps all of that and adds a simpler UI, niche-specific templates, and an opinionated setup flow.

<br/>

## Contributing

See the [contributing guide](CONTRIBUTING.md).

<br/>

## License

MIT
