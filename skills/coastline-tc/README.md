# Coastline TC, Agent Skills

Agent prompts for the 5-agent transaction coordination team. Owned by Tiffany Chau / Coastline TC Services. Built on top of Clipboard.

## Where things live

**Skills (this directory):**
```
skills/coastline-tc/
├── intake-agent/
│   ├── SKILL.md               (always loaded)
│   └── references/
│       ├── checklists.md      (loaded at Step 4)
│       └── outreach.md        (loaded at Step 5)
├── document-processor/
│   ├── SKILL.md
│   └── references/
│       ├── chase-cadence.md
│       └── daily-update.md
├── deal-monitor/
│   ├── SKILL.md
│   └── references/
│       └── report-format.md
├── communication-agent/
│   ├── SKILL.md
│   └── references/
│       ├── tone-guide.md
│       └── templates.md
└── closing-archive/
    ├── SKILL.md
    └── references/
        └── post-close.md
```

**Shared memory hub (Obsidian vault):**
```
/Users/tiffanychau/Library/Mobile Documents/com~apple~CloudDocs/Obsidian/Clipboard/Clipboard/Coastline TC Services/
├── deals/                     (one file per deal)
├── clients/                   (one file per client)
├── contacts/                  (escrow / title / attorneys / lenders / RMLOs)
├── agent-logs/                (per-agent daily activity logs)
├── approval-queue/            (pending / approved / rejected drafts)
├── escalations/               (decisions Tiffany must make)
├── _templates/
│   └── deal-template.md       (copied by Intake for every new deal)
└── dashboard.md               (Dataview live board, never written by agents)
```

## Why split files

Each `SKILL.md` is the always-loaded operating definition for the agent. Reference files load only when the agent's loop calls for them. This keeps token usage controlled. Clipboard pays for the always-loaded portion every cycle, but pulls reference files in only when needed.

If you want to change behavior:
- Edit the relevant SKILL.md or reference file in place
- Save (no rebuild required, Clipboard reads at runtime from `skills/`)
- Next cycle picks up the change

## Token discipline

Each SKILL.md is intentionally tight (under ~300 lines). Detail lives in references. If you need to add detail, add it to a reference file, not to SKILL.md.

If a SKILL.md grows beyond 350 lines, that's a signal to extract a new reference file.

**Selective-read rule:** Document Processor and Deal Monitor only read frontmatter, the active checklist, the Pending Approvals heading, and the last 7 days of the Deal Log on each cycle. They skip older log entries unless triggered. This keeps per-cycle context size flat as deals age.

## Source of truth

The `## Active Checklist` body of each deal file is the single source of truth for what's received vs missing. Agents parse `[x]` vs `[ ]` from the checklist body. There is no duplicate `items_missing` array in frontmatter.

The `## Communication Tracks` section is the single source of truth for who needs what and when. One track per party. Each chase email maps to exactly one track. Document Processor maintains tracks during the daily loop. This makes the chase logic explicit and per-party rather than re-derived from the checklist on every cycle.

## SA-First Intake

Nothing of substance happens until the Service Agreement is signed. The flow:

1. Intake form submitted (or Tiffany hand-enters in Clipboard)
2. Tiffany reviews and sets price
3. Pre-filled SA generated and queued for SA Send (template 19)
4. After Tiffany approves, Communication Agent sends
5. Wait for SA signed (escalate at Day 7 if not signed)
6. Once signed, Intake Agent creates the deal file, generates checklist, builds Drive folder, establishes Communication Tracks, drafts Bundles A, B, C
7. Hand off to Document Processor (deal starts in `docs` phase since intake phase is now skipped)

## Cancelled Deals

Deals can be cancelled mid-flow. When `deal_status: cancelled`:
- All chases stop immediately
- Daily updates stop
- Drive folder gets prefixed with `CANCELLED-`
- Final Deal Log entry summarizes where the deal was when cancelled
- Communication Tracks all flip to `status: cancelled`
- No invoice (we only charge at close; cancelled deals do not bill)
- Deal file stays in `deals/` but is skipped by all downstream agents

## Rush Deals (`is_rush: true`)

A deal is rush if `expected_coe` is within 14 days of intake (or Tiffany flips the flag mid-deal). Rush behavior:
- All standard cadences shift to 1-day urgent
- Stall threshold drops from 7 days in phase to 3 days
- Daily updates include `RUSH` indicator in subject
- Deal Monitor surfaces in URGENT tier regardless of other status
- Hard gates do not change (no shortcuts on compliance)

## SubTo Mortgage Servicer Watch List

When a mortgage statement arrives on a SubTo or Hybrid deal, Document Processor scans the servicer:
- **BLOCK:** HomeLoanServ. CRITICAL escalate. Stop deal flow until Tiffany decides.
- **CAUTION:** Mr. Cooper, Rocket Mortgage, Fifth Third Bank, M&T Bank, local banks, credit unions, small banks. Compliance flag added; deal continues with awareness.
- **CLEAR:** anything else (e.g., Chase, Wells Fargo, BofA).

## SubTo Pre-Closing Critical Tasks

Three SubTo / Hybrid pre-closing tasks are hard gates before closing:

1. **Mortgage portal login VERIFIED.** TC actually logs in successfully (with seller-coordinated 2FA). Not just "we have credentials."
2. **SubTo Authorization Packet flow (one packet, three sub-steps):** TC pre-fills (using mortgage statement + insurance dec, community templates) OR client supplies attorney-drafted version → TC sends pre-filled to client for confirmation → client confirms → TC sends to title flagged for signing at closing. The packet is signed once at closing, not separately pre-close.
3. **Seller Disclosure Packet** (~30 pages) signed by seller via DocuSign with pre-filled fields where possible.

## EMD Flow (Compressed Timeline)

EMD submission is the catalyst for title to start pulling commitment. Compress aggressively. **Target: EMD wired by buyer within 3 days of Bundle C going out.**

The flow:
- **Day 0:** Bundle C goes out. Asks title for file number, title search ETA, AND wire instructions in one email.
- **Day 1:** Title responds. Tiffany verbally verifies wire instructions same day. Wire instructions sent to buyer same day.
- **Day 2:** Buyer wires EMD. TC relays confirmation to title same day.
- **Day 3:** EMD receipt chase begins (24-hour cadence to title).

If any step slips past these targets, escalate the relevant party.

## Post-Close Add-On Services (Three)

The Service Agreement covers the core transaction. Three optional add-ons can be contracted (at intake or mid-deal). Each is a finite setup engagement, not a long-term TC obligation.

| Add-on | Frontmatter Flag | What TC Does |
|---|---|---|
| **Servicing** | `servicing_contracted: true` | Help client engage a servicing company, fill out setup forms, hand off docs. Servicing company runs the long-term cycle. |
| **After Closing SubTo** | `after_close_subto_contracted: true` | One-time post-close cleanup (60-day setup + year-1 touchpoint, then done). |
| **Post-Close Insurance Switchover** | `post_close_insurance_contracted: true` | Help coordinate the insurance transition. Critical sequencing: confirm new policy is BOUND before confirming old policy is cancelled. Distribute excess escrow funds appropriately. Especially important on SubTo because policy structure is non-standard and most agents don't know how to write it. |

Pre-close insurance work (ensuring buyer has a SubTo-capable agent and policy ready to bind at close) is part of the universal closing-prep checklist regardless of whether the post-close insurance add-on is contracted.

## TC Role Ends at Archive

TC's engagement formally ends at the 30-day client handoff after closing (or at the completion of post-close service setup if contracted). This is a hard boundary written into the Service Agreement.

**At archive:**
- Client receives the completed Drive folder with a 30-day download notice (template 26)
- Insurance verified in place for deed transfer
- Seller Disclosure on file
- Key location documented
- If mirror docs were drafted: handoff email clarifies who is holding release docs going forward (servicing company / attorney / title / client)

**TC does NOT:**
- Hold release documents long-term
- Track loan health on an ongoing basis
- Maintain seller contact info across years
- Coordinate lien releases decades after close
- Run the monthly servicing cycle

If post-close servicing is contracted, TC's role is to help the client engage the servicing company and complete setup. Once setup is done, the servicing company is the long-term party. TC is done.

If a client comes back years later asking for help, that's good-faith extra work, not contractual obligation.

## TC Role Boundaries (baked into every agent)

A TC is not a licensed agent and is not an attorney. We do not give legal advice. We do not fill out blank contracts on a client's behalf. We can walk through a contract with a client and prepare it collaboratively, but the client cannot hand us a blank contract and ask us to fill it out. This is a liability boundary.

Drafts that explain document mechanics, advise on transaction structure, or interpret legal terms get bounced. Recap and route is fine. Educate by sharing experience using "typically" / "in the past I've seen" framing. Never advise.

## SubTo Structure Decision Flow

Every Subject To and Hybrid deal goes through two upstream structure decisions during docs phase. Holding structure first; mirror docs (if applicable) second.

### Phase 1: Holding structure (always asked)

On Day 1 of docs phase, Document Processor surfaces the holding structure question to the buyer if not already set at intake. The default options presented are **LLC and personal only**. Land trust is NEVER proactively suggested.

- **If buyer brings up land trust themselves:** Land trust sub-items activate. TC asks if buyer has an attorney drafting trust docs or needs help finding one. **Trust docs MUST include the beneficiary-rights-transfer-on-default clause** (this eliminates the need for foreclosure if buyer defaults; CRITICAL escalate if missing). Buyer also needs a trustee assigned. Once docs verified and trustee set, TC sends trust docs to the title company and title handles most of the rest. `mirror_docs_decision` is set to `not_applicable`. Mirror docs are not required on land trust deals.
- **If LLC or personal:** Move to Phase 2 (mirror docs decision).

Templates: 16 (holding structure question, LLC + personal only), 17 (land trust attorney status), 18 (land trust docs to title).

### Phase 2: Mirror docs decision (only if holding structure is LLC or personal)

The cycle after holding structure is decided, Document Processor surfaces the mirror docs decision question to the buyer. Mirror docs (a mirror promissory note + mirror deed of trust) are an optional but recommended step that protects the seller and, indirectly, the buyer. Without them, the deal is a "naked SubTo".

- **If yes:** Document Processor activates mirror docs sub-items (drafter engagement, drafting, signature, recording, lien release strategy) and drafts outreach to attorney/bundl + title.
- **If no:** Compliance flag logged ("Naked SubTo. Buyer declined mirror docs.")

Closing & Archive verifies the structure path is fully resolved before archiving (Step 1a for holding structure, Step 1b for mirror docs).

Post-close lifecycle includes long-term mirror lien tracking until the underlying mortgage pays off (covered in Closing & Archive's `post-close.md`).

Mirror docs templates live at templates 12 (decision question), 13 (drafter engagement), 14 (lien release inquiry to title).

## No em dashes (ever)

In any drafted message body or subject line, agents do not use em dashes. Use periods, commas, colons, or parentheses instead. Communication Agent enforces this on send: any draft containing an em dash is fixed in place (if simple) or bounced.

## The team

| Agent | Triggers | Hands off to |
|-------|----------|--------------|
| **Intake Agent** | New deal submitted | Document Processor (after SA signed) |
| **Document Processor** | Daily cycle, every active deal | Closing & Archive (at closing_prep) |
| **Deal Monitor** | Daily cycle (after Document Processor) | (none, produces ops report for Tiffany) |
| **Communication Agent** | Tiffany approves an item in the approval queue | (none, sends email and clears the queue) |
| **Closing & Archive** | Deal phase reaches closing_prep | (none, archives + activates post-close) |

Tiffany is the human in the loop on every Tier 2+ communication. Agents draft, queue, and wait. Nothing goes out without her sign-off.

## The vault is the shared brain

Every agent reads from and writes to the Obsidian vault. The vault is the single source of truth. Agents do not communicate with each other directly; they coordinate through the deal file. If two agents want to update the same file at the same time, Document Processor has write priority.

## Updating these skills

These files are designed to be edited. They are not part of Clipboard's build. They live in `skills/coastline-tc/` and are loaded at runtime. Edit, save, and the next cycle picks up the change.

When making changes:
- Stay within the format (YAML frontmatter, role, TC boundaries, vault path, reference files, source of truth, non-negotiables, operating steps, what-it-does-not-do, escalation triggers)
- Test on a low-stakes deal before assuming the change is good
- Keep SKILL.md tight; push detail to references
- If a rule changes, update both the SKILL.md and any reference file that mentions it
- No em dashes anywhere

## Open items / future work

- Wire up the intake form (Tally / Typeform / Google Form / Clipboard-native) so Intake Agent has a structured trigger
- Wire up Google Drive integration so Intake Agent can auto-create the seven-folder structure
- Wire up email send adapter so Communication Agent can actually send (vs. drafting only)
- Wire up automatic SA pre-fill (template document with merge fields)
- First real-deal test run
- Tune capacity thresholds in deal-monitor/references/report-format.md based on actual volume
- Tune mortgage servicer watch list as patterns emerge from real deals
- Build coverage parity for the other 11 deal types (Wrap, Novation, Morby, Gator, etc.) to match the SubTo depth
