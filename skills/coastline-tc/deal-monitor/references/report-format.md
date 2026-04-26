# Daily Ops Report, Format and Priority Logic

Loaded by Deal Monitor at Step 6 of the daily loop. Generates the file written to `agent-logs/deal-monitor/YYYY-MM-DD.md`.

This is the first thing Tiffany sees in the morning. Skim-first design. Most important info at the top. No em dashes anywhere in the report.

## Report Template

```markdown
# Coastline TC, Daily Ops Report, [DATE]

## 🔴 URGENT, needs your decision today

[For each URGENT deal:]
- **[deal_id] [Address]** ([transaction_type], COE [date]): [specific issue, 1 line]
  Link: [escalation file] OR [deal file]

[If empty:]
- Nothing urgent today. ✓

## 🟡 ACTIVE, approval queue + notable activity

**Approval queue: [N] items pending**
- Closing this week: [list deals]
- Hard gate chases: [list deals]
- Standard chases: [count]
- Daily client updates: [count]

**Notable activity:**
- [deal_id] [Address]: [1-line summary of what happened today]
- [deal_id] [Address]: [1-line summary]

## 🟢 WAITING, intentional, no action needed

- [deal_id] [Address]: waiting on [reason] since [date], [days] days
- [deal_id] [Address]: waiting on [reason] since [date], [days] days

[If empty: omit this section.]

## ⚫ CANCELLED, last 7 days

- [deal_id] [Address]: cancelled [date]. Reason: [cancellation_reason]

[If empty: omit this section. Visibility only, no action expected.]

## ⚪ CLOSED, closed or archived today

- [deal_id] [Address]: closed [date]. Invoice paid: [✓ / ✗]

[If empty: omit this section.]

## 📊 Operations Summary

- **Active deals:** [N]
- **Closing this week:** [N]
- **New deals (last 7 days):** [N]
- **Approval queue:** [N] pending ([oldest age])
- **Open escalations:** [N]
- **Stalled (7+ days, active):** [N]

## ⚠️ Capacity

[Only if any threshold hit. Otherwise omit.]

- Approaching capacity: [N] active deals (threshold: 12)
- Intake bottleneck: [N] deals at intake awaiting SA (threshold: 4)
- Closing pressure: [N] closings this week (threshold: 4)
```

## Priority Logic (How to Classify)

For each deal, evaluate in this order. First match wins.

### URGENT 🔴

A deal is URGENT if ANY of:
- `escalation_flag: true` and escalation is open (no resolution logged)
- `compliance_flags` contains any flag with severity "critical" or "block"
- `expected_coe` is within 5 days AND any hard gate is open
- `days_in_phase >= 7` AND `deal_status: active` (stalled). For rush deals, threshold is `>= 3`.
- Hard gate item is past its hard gate date
- Document Processor flagged a CRITICAL issue today (pre-existing lien, missing Novation language, Morby gate violation, missing land trust beneficiary rights clause)
- Mortgage servicer is on BLOCK list (HomeLoanServ detected on a SubTo/Hybrid)
- Phase advancement requires Tiffany's approval (review to escrow_open) and the review is complete
- `is_rush: true` (always URGENT until close)

### ACTIVE 🟡

A deal is ACTIVE if NOT URGENT and ANY of:
- Has items in `## Pending Approvals` queued today
- `expected_coe` is within 14 days
- New documents arrived today
- Phase advanced today

### WAITING 🟢

A deal is WAITING if NOT URGENT/ACTIVE and:
- `deal_status: waiting_external` OR `deal_status: waiting_human`
- No movement expected for the next 24+ hours
- Has a clear waiting_reason

### CLOSED ⚪

A deal is CLOSED if:
- `deal_status: closed` AND closed within the last 24 hours
- `deal_status: archived` AND archived within the last 24 hours

If closed/archived more than 24 hours ago, omit from the report entirely.

## Approval Queue Sort Order

Within the ACTIVE section, the global approval queue is sorted by:

1. **Closing in <= 5 days:** top
2. **Hard gate item chase:** anything where the recipient owes a hard-gate item near or past its date
3. **Closing in <= 14 days:** closing prep activity
4. **Urgent chase:** items at urgent cadence (1-day reminder)
5. **Standard chase:** items at 3-day cadence
6. **Daily client updates:** last (lowest priority for sign-off, but never skipped)

Items older than 24 hours in the queue get a `[STALE 24h+]` prefix. Tiffany may have missed them.

## Stall Detection

A deal is "stalled" if:
- `deal_status: active`
- `days_in_phase >= 7`
- No items received in the last 5 days
- No phase advancement in the last 5 days

Stalled deals are URGENT. Always.

A deal in `waiting_external` is "long-waiting" if `days_in_phase >= 14`. Long-waiting deals are URGENT. Tiffany should decide whether to push, kill, or accept the wait.

## Capacity Thresholds (Default)

Adjust over time as Tiffany learns her real capacity. Initial thresholds:

| Metric | Approaching | Exceeded |
|--------|-------------|----------|
| Active deals total | 12 | 15 |
| Intake backlog (SA not signed) | 4 | 6 |
| Closings this week | 4 | 6 |
| New deals last 7 days | 5 | 8 |
| Approval queue depth | 15 | 25 |

When any "exceeded" threshold is hit, the CAPACITY block is required. When "approaching," include a softer warning.

## Notable Activity, How to Describe

One line per deal, max 12 words.

Good examples:
- `2025-007 22017 1st PL: Title commitment in. Forwarded to client for review.`
- `2025-009 145 Maple St: SubTo Addendum signed. Phase advanced to closing prep.`
- `2025-011 88 Oak: Quiet day. Standard chase queued.`

Bad examples:
- `2025-007 22017 1st PL: Things progressed today.` (vague)
- `2025-009 145 Maple St: We made some headway on documentation collection from the listing agent.` (too long)

## Tone Rules

- Calm. Direct. No alarm language.
- "Stalled 7 days" beats "ALERT: deal stuck!!"
- "Hard gate hit" beats "URGENT PROBLEM"
- The 🔴 tier handles the urgency signal. Words don't need to.
- No em dashes anywhere.

## Empty Day

If nothing meaningful happened across the whole portfolio:

```markdown
# Coastline TC, Daily Ops Report, [DATE]

## 🟡 ACTIVE
[X] active deals. All on track. No items aging in approval queue.

## 📊 Operations Summary
- Active deals: [N]
- Closing this week: [N]
- Approval queue: [N] pending
- Open escalations: 0

Quiet day.
```

Don't pad. A short report is honest. Tiffany prefers it.
