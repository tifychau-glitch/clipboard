# Post-Close Services, Activation & Handoff

Loaded by Closing & Archive Agent only when a closed deal has post-close services contracted (`servicing_contracted: true` or `after_close_subto_contracted: true`).

## TC Role Boundary at Post-Close

**Read this first. The TC role ends at archive, with or without a post-close service contract.**

- **Without a post-close service add-on:** TC's job ends after the standard 30-day client handoff (Closing & Archive Step 2 in main SKILL.md). We are not the long-term holder of mirror docs releases, signed authorization packets, or anything else. The buyer is responsible for maintaining everything from there. Anything we do beyond the 30-day window (answering a question, locating a doc, etc.) is good-faith extra work, not contractual obligation.
- **With a post-close service add-on:** TC's role is to help the client set up the appropriate servicing relationship (find a servicing company, fill out applications, get the servicing setup paperwork in order, hand off documents to the servicing company). Once the servicing company is engaged and operating, **TC is done.** The servicing company tracks payments, holds release docs, manages the loan health, and is the long-term party. TC is not a substitute for a servicing company.

**Mirror docs lien release in 20 years is not the TC's responsibility.** If a client comes back asking us to help locate a seller for a lien release decades later, that falls outside our engagement. We can help in good faith but we are not contractually obligated. Clients with mirror docs should either: (a) opt into a servicing service that holds release documents, (b) ask their attorney or title company to hold release documents, or (c) accept that long-term lien release is their responsibility.

This boundary is in the Service Agreement: TC engagement ends at the close of the transaction (or at the conclusion of the contracted post-close service term).

## Activation Logic

After deal is `archived`, check frontmatter:

| Flag | Service Type | Section |
|------|--------------|---------|
| `servicing_contracted: true` AND `transaction_type` is "Seller Finance" | Servicing, SF | Section A |
| `servicing_contracted: true` AND `transaction_type` is "Subject To" | Servicing, SubTo | Section B |
| `servicing_contracted: true` AND `transaction_type` is "Hybrid" | Servicing, Hybrid | Section C (combine A + B) |
| `after_close_subto_contracted: true` | After Closing SubTo | Section D |
| `post_close_insurance_contracted: true` | Post-Close Insurance Switchover | Section E |

A deal can have multiple flags. None of these create a long-term TC obligation; they create a short-term setup engagement.

When activating:
- Set `post_close_status: active`
- Append a new `## Post-Close Service Setup Checklist` heading to the deal file
- Render the relevant checklist(s) below
- Append a Deal Log entry:

```
### YYYY-MM-DD, closing-archive
- Post-close services activated: [list service types].
- Setup checklist generated. TC role: help client engage the servicing company and complete setup.
- TC engagement ends when servicing setup is complete and the servicing company is operating.
```

## Operating Cadence Post-Close

These are SETUP checklists, not ongoing maintenance. Once items are complete, TC engagement ends.

- **Setup window:** typically the first 30-60 days post-close
- **Triggered review:** if a setup item is blocked, escalate
- **No monthly cycle.** TC is not the servicer. The servicing company runs the monthly cycle.

---

## Section A, Servicing, Seller Finance

For deals where the client has contracted a servicing add-on for a seller-financed note. TC helps set up the servicing relationship.

### Setup checklist

- [ ] Servicing company selected (TC may help recommend; client decides)
- [ ] Servicing setup form completed by client
- [ ] Borrower payment instructions delivered to borrower (servicing company drafts; TC routes if needed)
- [ ] First payment confirmed received by servicing company
- [ ] Year-end 1098 setup configured by servicing company
- [ ] All transaction docs (note, deed of trust, amortization schedule) delivered to servicing company

Once all checked, post_close_status flips to `complete`. TC engagement ends.

### Flags during setup

- Servicing company selection stalled past 30 days: escalate
- First payment routing fails: escalate (this is a setup issue, not a TC long-term issue)

---

## Section B, Servicing, Subject To

For deals where the client has contracted servicing on the underlying SubTo loan. TC helps set up the servicing relationship.

### Setup checklist

- [ ] Servicing company selected
- [ ] Servicing setup form completed by client
- [ ] Mortgage payment routing established (auto-pay from servicing company to underlying lender)
- [ ] Insurance payment routing established
- [ ] Tax payment routing established
- [ ] Mortgage portal login info delivered to servicing company (so they can monitor)
- [ ] Underlying lender contact info delivered to servicing company
- [ ] First mortgage payment confirmed posted by underlying lender (verifies routing works end-to-end)
- [ ] Mirror docs release documents (if applicable) handed off to servicing company for long-term holding
- [ ] All transaction docs delivered to servicing company

Once all checked, post_close_status flips to `complete`. TC engagement ends. The servicing company runs the monthly cycle, holds release docs, and is the long-term party.

### Flags during setup

- Routing setup fails: escalate
- Underlying loan login does not work for servicing company: escalate

---

## Section C, Servicing, Hybrid

Combine Section A and Section B. Run both setup checklists. Same end-state: setup complete, TC engagement ends, servicing company takes it from there.

---

## Section D, After Closing SubTo

For clients who contracted Coastline TC for one-time post-close SubTo cleanup. Different from servicing. This is a finite engagement (typically 60-day setup + one annual touchpoint, then done) where TC handles the immediate post-close transition tasks but is NOT a long-term servicer.

### One-time setup (first 60 days post-close)

- [ ] Authorization Packet on file (verified, not just signed at close)
- [ ] Insurance updated to buyer-as-loss-payee (or buyer-direct policy if replaced)
- [ ] Tax mailing address updated to buyer / buyer's entity
- [ ] Mortgage login confirmed working post-close
- [ ] First post-close mortgage payment confirmed posted (verifies routing works)
- [ ] Buyer briefed on red flags to watch for going forward (due-on-sale, insurance, payment posting)

### Annual touchpoint (year 1 only, unless extended)

- [ ] Annual underlying loan health check
- [ ] Insurance renewal verified (still buyer-as-loss-payee)
- [ ] Mortgage login still works
- [ ] Year-end check-in with client

After year 1 annual touchpoint, this engagement ends. TC's role is complete. The buyer takes it from there or contracts ongoing servicing separately.

### Flags during setup

- Authorization Packet missing or unsigned post-close: CRITICAL escalate
- Insurance not updated by Day 60: escalate
- Login broken: priority fix during setup window
- Any due-on-sale activity discovered during setup: CRITICAL escalate

---

## Section E, Post-Close Insurance Switchover

For clients who contracted Coastline TC to coordinate the insurance transition post-close. Especially important for SubTo because the policy structure is non-standard and most insurance agents don't know how to write it correctly.

### Setup checklist (sequence matters)

- [ ] SubTo-capable insurance agent identified (if SubTo / Hybrid). Client provides; TC may help recommend if needed.
- [ ] New buyer's insurance policy bound (active, paid, in force). `new_insurance_bound: true`. Confirm with the insurance agent that the policy is officially active before doing anything else.
- [ ] Old seller's insurance cancelled. **Only after new policy is confirmed bound.** This sequencing is critical to avoid a coverage lapse. `old_insurance_cancelled: true`.
- [ ] Excess escrow funds (if any) distributed appropriately. The old policy may have had an escrow account with the underlying lender; if there's a refund coming, coordinate with the underlying lender, the seller (if applicable), and the client to make sure it goes to the right place per the deal structure. `excess_escrow_funds_distributed: true`.

### Critical rules

1. **Never confirm cancellation of the old policy until the new policy is confirmed bound.** Lapse = exposure for everyone.
2. **Confirm "bound" means active, not just quoted.** Get a binder or policy declaration page in writing.
3. **Excess escrow funds** can come from the old insurance escrow held by the underlying lender. On a SubTo, this can get messy because the underlying loan stays in place but the insurance is changing. Coordinate carefully.

Once all checked, post_close_status flips to `complete` (assuming no other post-close services are also active). TC engagement ends.

### Flags during setup

- Insurance agent not SubTo-capable (writes a standard policy that doesn't work for SubTo): escalate, find a different agent
- Old policy cancelled before new is bound: CRITICAL escalate, fix coverage gap immediately
- Excess escrow funds distributed to wrong party: escalate, work with underlying lender to correct
- New policy not bound by Day 30 post-close: escalate

---

## Closing Out Post-Close

A deal's post-close phase ends when:

- Servicing setup checklist complete (Sections A, B, C): TC engagement ends
- After Closing SubTo year-1 cycle complete (Section D): TC engagement ends, no extension contracted
- Client opts out mid-setup: log it, end engagement, deliver any docs we held to the appropriate party

When ending:
- Set `post_close_status: complete`
- Append final Deal Log entry summarizing the post-close engagement
- Note in the log: "TC engagement closed. [Servicing company name / N/A] is now the long-term party. [Mirror docs releases handed off to: servicing company / attorney / title / client]."

The deal record stays archived. Never delete.

---

## What TC Does NOT Do (Even with Servicing Contracted)

- Does not hold release documents long-term. Servicing company, attorney, or title holds them.
- Does not run the monthly servicing cycle. Servicing company does.
- Does not track loan health on an ongoing basis post-setup. Servicing company does.
- Does not maintain contact info for sellers across years. The buyer or servicing company does.
- Does not process payments or send statements. Servicing company does.
- Does not coordinate lien release decades after close. The party holding the release docs (servicing / attorney / title / client) does.

If a client comes back years later asking for help on something outside the contracted engagement, that's good-faith extra work. We can help if we choose, but we're not bound to.
