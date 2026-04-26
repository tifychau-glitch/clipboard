# Chase Cadence, Every Compliance Item

Loaded by Document Processor during the daily scan. Each chase email maps to exactly one Communication Track. Bundle by track, not by document.

For each unchecked item in the body checklist, look up:
- **Responsible party:** which track (party) owes this
- **Trigger date:** when the clock starts
- **Standard cadence:** reminder interval when not urgent (default 3 days)
- **Urgent cadence:** reminder interval when within 5 days of hard gate OR COE within 7 days OR rush deal (default 1 day)
- **Hard gate:** when this becomes a phase blocker
- **Action on miss:** what to do if hard gate is hit and item still not received

## Cadence Defaults

- **Standard:** every 3 days
- **Urgent:** every 1 day
- **Rush deals (`is_rush: true`):** all standard cadences shift to 1-day for the duration of the deal
- **Bundle by Track:** group all items owed by one party into one email per day, max
- **Never chase the same person twice in one day**

## Tone for All Chase Emails

- Warm, professional, plain language
- Recap what's needed and why we need it (1 short sentence is fine)
- Use "typically," "in the past I've seen," "I've had investors do" for context-sharing
- Never explain document mechanics or advise on transaction structure
- For deal-structure questions, route back to the buyer
- No em dashes. Use periods, commas, colons, or parentheses

---

## Universal Items

| Item | Responsible Track | Trigger | Standard | Urgent trigger | Hard gate | On miss |
|------|-------------------|---------|----------|----------------|-----------|---------|
| Signed Service Agreement | Client | (Already gated by Intake) | n/a | n/a | Cannot create deal file | n/a |
| TC Info Sheet | Client | After SA signed (Bundle A) | 3 days | none | None | Soft chase only |
| Open Escrow | Tiffany / Escrow | Once SA signed | none | none | Required for docs phase | Internal action |
| EMD Receipt from title | Title officer | Once buyer wires EMD | 1 day (always urgent) | always urgent | docs to title transition | Escalate at Day 3 past wire |
| Operating Agreement / LLC Docs | Client | When entity name set | 3 days | Day 7+ if entity buyer | None | Soft chase |
| Contracts / Addendums | Listing agent or Seller direct | Bundle B day | 3 days | Day 5+ | None | Escalate at Day 10 |
| Title Search / Commitment | Title officer | Once escrow opened (3 to 10 days post-EMD) | 3 days | Day 10+ since open | title to review transition | Escalate at Day 14 |
| Seller Disclosure Packet (sent) | Tiffany internal | After Bundle B | 1 day until sent | n/a | None | Send by Day 3 |
| Seller Disclosure Packet (signed by seller) | Seller direct or via Listing agent | Once sent | 3 days | Day 14+ since send, or COE within 14 days | escrow_open to closing_prep | Escalate at 14 days pre-COE |
| TC Final Invoice | Tiffany internal | Closing prep entry | none | none | Closing pkg | Closing Agent owns |
| Preliminary Closing Docs & HUD | Escrow / Title | 5 days before COE | 1 day | Always urgent | closing_prep to closing | Escalate at 3 days before COE |
| Final Closing Docs & HUD | Escrow / Title | Day before COE | 1 day | Always urgent | closing to post_close | Escalate same-day if missing |
| Recorded Documents | Title / County | Day after COE | 1 day | Always urgent | post_close | Escalate at Day 3 post-close |

---

## EMD Flow (Detailed, Read This Carefully)

EMD submission is the catalyst that gets title to start pulling commitment. Compress the timeline aggressively. **Target: EMD wired by buyer within 3 days of Bundle C going out.**

### Step 1: Bundle C requests wires upfront (Day 0)

Bundle C goes out as part of intake (after SA signed). It asks title for file number, title search ETA, AND wire instructions for EMD in the same email. Don't wait for a separate round trip.

### Step 2: Title responds (typically Day 1)

When title responds with file number AND/OR wire instructions, Document Processor processes immediately:

- File number → populate frontmatter, mark Open Escrow `[x]`
- Wire instructions → drop into Tiffany's review queue with note: "Verbal verification required before sending to buyer. Call title today to confirm."

If title responds with file number but NOT wire instructions, draft an immediate same-day follow-up requesting wires (template "Wire Instructions Request to Title"). Urgent cadence (1-day) until received.

### Step 3: Same day, Tiffany verbally verifies

Tiffany calls title to confirm wire instructions verbally. Fraud-prevention step. Wire fraud is a known risk vector.

If title cannot be reached for verbal verification, escalate. Do NOT pass unverified wire instructions to the buyer.

### Step 4: Same day verbal verification done, send wire instructions to buyer

Draft "Wire Instructions to Buyer" email immediately after verification (template 21). Includes the verified wire instructions, EMD amount, and a clear ask: "wire as soon as you can, ideally today or tomorrow."

### Step 5: Buyer wires EMD (target: Day 2 or Day 3)

Buyer sends confirmation to TC once wire is initiated. If buyer hasn't wired within 24 hours of receiving instructions, send a friendly nudge.

### Step 6: TC relays buyer's wire confirmation to title and requests EMD receipt (same day)

Same-day relay to title. Triggers the EMD Receipt chase loop.

### Step 7: TC chases title for EMD receipt every 24 hours until received

Every 24 hours, no exceptions, until title sends back the receipt.

If 3+ chases pass without response from title, escalate.

### Total target timeline

| Day | Event |
|---|---|
| 0 | Bundle C goes out (escrow opening request + wire request combined) |
| 1 | Title responds with file number + wires; Tiffany verifies; sent to buyer same day |
| 2 | Buyer wires EMD; TC relays to title same day |
| 3 | EMD receipt chase begins; ideally receipt arrives within 24 hours |

If any step slips past these targets, escalate the relevant party. EMD slowness almost always traces back to one of: title slow to respond (chase aggressively), buyer slow to wire (nudge), or title slow to send receipt (24-hour cadence).

---

## SubTo Mortgage Servicer Watch List (Event-Triggered)

When a mortgage statement is received on a SubTo or Hybrid deal, Document Processor scans the servicer name and sets `mortgage_servicer` and `mortgage_servicer_risk` in frontmatter.

| Servicer | Risk Level | Action |
|----------|-----------|--------|
| HomeLoanServ | **BLOCK** | CRITICAL escalate immediately. Do NOT proceed with SubTo. Stop the deal flow until Tiffany reviews and decides. |
| Mr. Cooper | CAUTION | Add compliance flag: "Mr. Cooper servicer. Higher risk of due-on-sale. Buyer should be aware." Continue. |
| Rocket Mortgage | CAUTION | Same |
| Fifth Third Bank | CAUTION | Same |
| M&T Bank | CAUTION | Same |
| Local banks | CAUTION | Same |
| Credit unions | CAUTION | Same |
| Small banks | CAUTION | Same |
| Chase, Wells Fargo, BofA, etc. (large national, not on the list above) | CLEAR | Continue normally. |

If servicer is on the BLOCK list: write the escalation immediately, do not draft any further chase emails for this deal until Tiffany's decision is logged.

If servicer is on the CAUTION list: add the compliance flag, draft a one-line note in the next Daily Client Update letting the buyer know which servicer it is and that we're watching for due-on-sale activity. Do not advise on what to do; just inform.

---

## Subject To and Hybrid

| Item | Responsible Track | Trigger | Standard | Urgent | Hard gate | On miss |
|------|-------------------|---------|----------|--------|-----------|---------|
| SubTo Addendum (signed by seller) | Seller direct or via Listing agent. Buyer provides the document; TC routes for seller signature only. | After buyer confirms terms communicated to seller AND hands TC the document | 3 days | When COE within 14 days | escrow_open to closing_prep | Escalate at 14 days pre-COE |
| Seller Acknowledgments (signed by seller) | Seller. Buyer provides; TC routes for signature only. | After buyer confirms terms communicated to seller | 3 days | When COE within 14 days | escrow_open to closing_prep | Escalate at 14 days pre-COE |
| Mortgage Statement (most recent) | Seller direct or via Listing agent | Day of escrow open | 3 days | Day 5+ post-escrow | Day 7 post-escrow | Escalate at Day 7 |
| Mortgage Servicer Risk Check | (event-triggered, internal) | Mortgage statement received | n/a | n/a | escrow_open if BLOCK | Stop deal flow if BLOCK servicer |
| Insurance Declaration page | Seller | Day of escrow open | 3 days | Day 7+ | None hard, soft block | Escalate at Day 10 |
| Mortgage Login credentials | Seller | Day of escrow open | 3 days | Pre-closing prep | Pre-close gate | Escalate at Day 10 |
| Mortgage Portal Login VERIFIED (TC actually logs in) | Tiffany + Seller (coordinated 2FA) | After credentials received | 3 days | Within closing_prep | closing_prep to closing | Escalate at Day 7 in closing_prep |
| New insurance policy ready to bind at close (SubTo-capable agent) | Client (or insurance agent client engaged) | After Bundle A | 3 days | When COE within 14 days | closing_prep to closing | Escalate at 10 days pre-COE if no agent identified |
| SubTo Auth Packet (pre-fill sub-step) | Tiffany internal | Once mortgage statement + insurance dec received | 1 day | When COE within 14 days | closing_prep | Escalate at Day 5 |
| SubTo Auth Packet (client-confirm sub-step) | Client | Once pre-filled | 3 days | Day 5+ since sent | closing_prep | Escalate at Day 7 |
| SubTo Auth Packet (sent to title sub-step) | Tiffany internal | Once client confirms | 1 day | n/a | closing_prep to closing | Escalate at Day 3 |

**SubTo CRITICAL note:** Pre-existing liens found on title commitment (event-triggered check). If found, STOP. Escalate.

**SubTo TC boundary note:** TC does NOT draft the SubTo Addendum or Seller Acknowledgments. Buyer provides those. TC routes them to seller for signature only, and only after the buyer confirms they have communicated the terms to the seller.

**Mortgage Portal Login Verification:** This is a critical pre-close task. We need to actually log in (not just have credentials). The seller helps us coordinate 2FA in real time. Schedule a 5-minute window with the seller to verify successful login. If verification fails, escalate; we cannot close without portal access.

**SubTo Authorization Packet pre-close flow (one packet, three sub-steps):** (1) TC pre-fills using mortgage statement + insurance dec (community templates) OR client supplies attorney-drafted custom packet, (2) TC sends pre-filled packet to client for confirmation that it's correct, (3) once confirmed, TC sends to title with note that it needs to be signed at closing. Do not skip any sub-step. The packet itself is signed once at closing (by whoever needs to sign per title's process), not separately pre-close.

### Holding Structure Items (SubTo and Hybrid, always asked)

| Item | Responsible Track | Trigger | Standard | Urgent | Hard gate | On miss |
|------|-------------------|---------|----------|--------|-----------|---------|
| Holding structure decision (buyer) | Client | Day 1 of docs phase | 3 days | Day 14+ since asked | None | Escalate at Day 21 if no response |

### Land Trust Items (SubTo and Hybrid, conditional on holding_structure = land_trust)

| Item | Responsible Track | Trigger | Standard | Urgent | Hard gate | On miss |
|------|-------------------|---------|----------|--------|-----------|---------|
| Land trust attorney status confirmed | Client | Once holding_structure = land_trust | 3 days | Day 7+ since flip | None | Escalate at Day 14 |
| Land trust docs drafted | Buyer's attorney | Once attorney engaged | 3 days | Day 14+ since engagement | escrow_open to closing_prep | Escalate at Day 21 |
| Land trust beneficiary rights clause verified | Tiffany | Once docs drafted | 1 day | Same-day | escrow_open to closing_prep | Escalate immediately if clause missing |
| Land trust trustee assigned | Client | Once docs drafted | 3 days | Day 7+ since drafted | escrow_open to closing_prep | Escalate at Day 10 |
| Land trust docs sent to title company | Tiffany | Once docs + clause + trustee verified | 1 day (urgent) | Always urgent | escrow_open to closing_prep | Escalate at Day 3 |

**Land trust note:** TC does NOT proactively suggest land trust. The Holding Structure question presents LLC and personal as the default options. Land trust is only engaged if the buyer brings it up first. If buyer brings it up: TC asks about attorney status, helps coordinate the search if needed, then sends drafted trust docs to title (title handles most of the rest).

**Land trust beneficiary rights clause (CRITICAL):** Trust docs MUST state that beneficiary rights transfer to the seller if the buyer doesn't pay. This eliminates the need for foreclosure if the buyer defaults. Verify this clause is present before sending trust docs to title. If missing, escalate immediately and route back to the drafting attorney.

**Land trust trustee:** Typically the buyer hires a trustee (third party) to manage the trust. Confirm trustee is named in the docs.

### Mirror Docs Items (SubTo and Hybrid, conditional on holding_structure = llc OR personal AND buyer decision = yes)

| Item | Responsible Track | Trigger | Standard | Urgent | Hard gate | On miss |
|------|-------------------|---------|----------|--------|-----------|---------|
| Mirror docs decision (buyer) | Client | Day after holding_structure decided | 3 days | Day 14+ since asked | None | Escalate at Day 21 if no response |
| Mirror docs drafter engaged | Tiffany / attorney / bundl | Once buyer says yes | 3 days | Day 7+ since decision | None | Escalate at Day 14 |
| Mirror Promissory Note drafted | Attorney / bundl | Once drafter engaged | 3 days | Day 14+ since engagement | escrow_open to closing_prep | Escalate at Day 21 |
| Mirror Deed of Trust drafted | Attorney / bundl | Once drafter engaged | 3 days | Day 14+ since engagement | escrow_open to closing_prep | Escalate at Day 21 |
| Mirror docs signed by buyer | Client | Once drafted | 3 days | Day 7+ since drafted | escrow_open to closing_prep | Escalate at Day 14 |
| Mirror docs recorded with title | Title officer | Once signed | 3 days | Pre-COE | closing | Escalate at Day 7 pre-COE |
| Mirror docs lien release strategy documented | Tiffany (with title input) | Once recorded | 3 days | Day 30+ since recorded | None hard, soft block on archive | Escalate at Day 30 |

**Mirror docs note:** TC raises the question, recaps trade-offs, shares experience using "typically I recommend this because" framing. TC does NOT advise on whether to do mirror docs. Once buyer says yes, TC coordinates engagement, drafting, signature, recording, and lien release planning.

---

## Wrap Dispo

| Item | Responsible Track | Trigger | Standard | Urgent | Hard gate | On miss |
|------|-------------------|---------|----------|--------|-----------|---------|
| RMLO Packet | RMLO | Once RMLO contact established | 3 days | Day 7+ | escrow_open to closing_prep | Escalate at Day 10 |
| Acquisition Closing Docs | Acquisition escrow | Once acquisition contract signed | 3 days | Day 5+ pre-close | escrow_open to closing_prep | Escalate at Day 7 |
| Wrap Note + Wrap Deed of Trust | Attorney / TC | Pre closing prep | 3 days | Always urgent close to COE | closing | Escalate at Day 5 pre-COE |
| Borrower disclosures | RMLO | Once RMLO packet started | 3 days | Day 7+ | closing_prep | Escalate at Day 10 |

---

## Novation

| Item | Responsible Track | Trigger | Standard | Urgent | Hard gate | On miss |
|------|-------------------|---------|----------|--------|-----------|---------|
| Listing Agreement (language check) | Listing agent | Intake Day 0 | 1 day until received | Always urgent | None for receipt, but CRITICAL flag if language missing on receipt | Block deal if language missing |
| Novation Agreement | Attorney / TC | Once acquisition signed | 3 days | Day 5+ | escrow_open to closing_prep | Escalate at Day 7 |
| Acquisition contract | Listing agent | Intake | 3 days | Day 5+ | None | Escalate at Day 10 |
| End-buyer contract | Buyer's agent | Once end-buyer secured | 3 days | Day 5+ | closing_prep | Escalate at Day 7 |

**Novation CRITICAL note:** Listing agreement must contain language preventing buyer's agent from changing title companies. If missing, STOP. Escalate.

---

## Lending / Loan Sponsorship / Gator

| Item | Responsible Track | Trigger | Standard | Urgent | Hard gate | On miss |
|------|-------------------|---------|----------|--------|-----------|---------|
| Funding source confirmed | Client | Intake | 3 days | Pre escrow open | escrow opens | Hard block, escalate Day 5 |
| Loan application | Client / Lender | Intake | 3 days | Day 7+ | None | Escalate Day 10 |
| Term sheet signed | Client / Lender | Once application complete | 3 days | Day 5+ | escrow_open | Escalate Day 7 |
| EMD Loan Agreement (Gator) | Gator lender | Once EMD due | 1 day | Always urgent | escrow_open to closing_prep | Escalate Day 3 past due |
| Gator note + collateral assignment | Attorney / TC | Once Gator agreement signed | 3 days | Pre-COE | closing_prep | Escalate Day 7 |

---

## Morby Method (Double Close)

| Item | Responsible Track | Trigger | Standard | Urgent | Hard gate | On miss |
|------|-------------------|---------|----------|--------|-----------|---------|
| Closing #1 contract | Acquisition escrow | Intake | 3 days | Day 5+ | None | Escalate Day 10 |
| Closing #2 contract | Disposition escrow | Once buyer secured | 3 days | Day 5+ | closing_prep | Escalate Day 7 |
| Holdback / release instructions | Both escrows | Pre closing prep | 3 days | Always urgent close to COE | escrow_open to closing_prep | Escalate Day 5 pre-COE |
| Loan Docs (if applicable) | Lender | Once loan secured | 3 days | Day 5+ | closing_prep | Escalate Day 7 |
| Closing #1 fully recorded | Title | Closing #1 day | Same-day | none | Closing #2 cannot schedule until this is done | CRITICAL escalate if Closing #2 attempted before this |

**Morby CRITICAL note:** Closing #2 cannot be scheduled before Closing #1 is signed and recorded. If anyone attempts to schedule Closing #2 prematurely, STOP. Escalate.

---

## Multi-Family

| Item | Responsible Track | Trigger | Standard | Urgent | Hard gate | On miss |
|------|-------------------|---------|----------|--------|-----------|---------|
| Funding source confirmed | Client | Intake | 3 days | Pre escrow open | escrow opens | Hard block |
| Rent rolls + T-12 + leases | Listing agent / seller | Intake | 3 days | Day 7+ | escrow opens | Escalate Day 10 |
| Estoppels | Listing agent / property mgr | Once contract executed | 3 days | Pre-COE | closing_prep | Escalate Day 7 |
| Service contracts inventory | Seller | Intake | 3 days | Day 7+ | None | Escalate Day 10 |

---

## Rush Deal Rules (`is_rush: true`)

When a deal is flagged rush (COE within 14 days at intake, or Tiffany flips it on mid-deal):

- All standard cadences shift to 1-day (effectively become urgent for the duration)
- Stall threshold drops from 7 days in phase to 3 days
- Daily updates remain daily but include `RUSH` indicator in subject line
- Deal Monitor surfaces in URGENT tier regardless of other status
- Hard gates do not change; you cannot shortcut compliance
- Pre-closing critical tasks (mortgage portal login verification, Auth Packet) get drafted as soon as the prerequisites land, not on a wait cycle

---

## When to Switch from Standard to Urgent (non-rush deals)

A reminder is **urgent** when ANY of:
- Item is within 5 calendar days of its hard gate
- COE is within 7 calendar days and item is still missing
- Item has been chased 3+ times without response
- Phase is `escrow_open` and the item is needed for `closing_prep` advancement
- Cadence table marks the item as "always urgent"
- Deal is rush

Otherwise it's standard.

## When to Stop Chasing

Stop chasing and escalate when:
- Item passed its hard gate
- Recipient has been silent for 3 consecutive chase emails
- Recipient has explicitly declined or pushed back
- COE has been moved due to the missing item

Escalation means writing to `escalations/` AND flagging `escalation_flag: true` in deal frontmatter. Do not keep sending chases on autopilot.
