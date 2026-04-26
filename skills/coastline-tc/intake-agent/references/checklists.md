# Intake Checklists, All Deal Types

Loaded by Intake Agent at Step 6 (after SA is signed and the deal file is created). Pull the universal block plus the deal-type-specific block. Render under the deal file's `## Active Checklist` heading. Mark received items `[x]`, missing `[ ]`. The body checklist is the single source of truth. Do not maintain a duplicate frontmatter array.

Hard-gate items are flagged inline. Document Processor and Closing & Archive enforce gates.

---

## Universal (every deal type with a seller)

1. Daily Check In Notes
2. TC Info Sheet
3. Client Folder (Google Drive structure created at intake)
4. Signed Service Agreement (Gate: must be signed before deal file is created)
5. Open Escrow
6. EMD Receipt from title (Gate: required before docs to title transition)
7. Operating Agreement / LLC Docs (if buyer is entity)
8. Contracts / Addendums
9. Title Search & Identity Search
10. Title Commitment (Gate: required before title to review transition)
11. Seller Disclosure Packet (sent to seller via DocuSign with pre-filled fields where possible; signed by seller). Standard 3-day chase. Urgent when COE within 14 days. Skip on lending-only structures (Lending Deal, Loan Sponsorship) where there is no seller in the traditional sense.
12. TC Final Invoice (added to escrow at closing prep, not collected upfront)
13. Preliminary Closing Docs & HUD
14. Final Closing Docs & HUD
15. Recorded Documents
16. Customer Closing Packet Delivered

**Seller Disclosure Packet note:** ~30 pages covering property details (garbage day, water company, landscaping, roof condition, etc.). Seller may not know everything; tell them to do their best and sign. Send via DocuSign with as many fields pre-filled as possible. Ask for any obvious info upfront so we can pre-fill (year built, HOA, common knowns).

---

## Deal-Type Specific

### 1. Cash Deal
- Funding source confirmed (own funds / lender / creative). Hard block before escrow opens.
- Proof of funds letter

### 2. Seller Finance
- Promissory Note draft
- Deed of Trust / Mortgage draft
- Amortization schedule
- Late fee + default terms confirmed

### 3. Agreement for Sale
- AFS contract (state-specific)
- Escrow holdback instructions
- If SubTo component: include all SubTo items below

### 4. Subject To
- SubTo Addendum (signed by seller). Buyer provides the document; TC routes for seller signature only. Standard 3-day chase cadence. Urgent only when COE within 14 days.
- Seller Acknowledgments (signed by seller). Same rule as above. Standard 3-day chase. Urgent only when COE within 14 days.
- SubTo Authorization Packet (one packet, three sub-tasks tracked). Gate: required before closing_prep to closing.
  - Pre-filled by TC (using mortgage statement + insurance info, community templates) OR client provides attorney-drafted version
  - Sent to client for confirmation that contents are correct
  - Sent to title with closing-day signing flag
- Mortgage Statement (most recent, from seller). Hard gate: Day 7 after escrow open.
- Mortgage servicer risk check. Event-triggered when mortgage statement received. See "Mortgage Servicer Watch List" below.
- Insurance Declaration page (from seller). This is the seller's existing policy. Buyer's NEW policy is a separate item below.
- New insurance policy ready to bind at close (buyer's policy, SubTo-capable insurance agent identified). Pre-closing task. Gate: required before closing_prep to closing. Especially important for SubTo because the policy structure is non-standard; insurance agent must know how to write a buyer-as-loss-payee policy with the underlying lender as the named insured (or other SubTo-appropriate structure).
- Mortgage Login credentials (from seller).
- Mortgage portal login VERIFIED (TC actually logs in successfully, coordinating 2FA with seller). Pre-closing task. Gate: required before closing_prep to closing.
- Pre-existing lien check on title commitment. Event-triggered when title commitment is received. CRITICAL escalate if liens are found.
- Holding structure decision (buyer). Always asked. Always present. Document Processor surfaces this on Day 1 of docs phase if not already set at intake. Determines whether mirror docs apply.
- Mirror docs decision (buyer). Always present. Conditional on `holding_structure` not being `land_trust`. Document Processor surfaces this AFTER holding structure is decided, only if applicable.

#### If holding_structure = land_trust, add these sub-items (Document Processor activates):
- Land trust attorney status confirmed (buyer already has one, OR TC helps find one)
- Land trust docs drafted (if buyer didn't already have them)
- Land trust beneficiary rights clause verified (trust must state beneficiary rights transfer to seller on default; this eliminates the need for foreclosure)
- Land trust trustee assigned (typically a hired trustee to manage the trust)
- Land trust docs sent to title company (title handles most of the rest from there)

When holding_structure is set to `land_trust`, set `mirror_docs_decision` to `not_applicable` and skip the mirror docs sub-items entirely.

#### If holding_structure = llc OR personal, the mirror docs decision question is asked next.

#### If mirror_docs_decision = yes, add these sub-items (Document Processor activates):
- Mirror docs drafter engaged (attorney OR bundl)
- Mirror Promissory Note drafted
- Mirror Deed of Trust drafted
- Mirror docs signed by buyer (buyer is borrower; promises payment to seller and pledges property as collateral)
- Mirror docs recorded with title (this places the lien)
- Mirror docs lien release strategy documented (pre-signed release on file OR future-coordination plan; consult title company)

#### If mirror_docs_decision = no:
- Add compliance flag: "Naked SubTo. Buyer declined mirror docs. No protective lien for seller. Logged on [date]."
- No further mirror docs items added.

#### Mortgage Servicer Watch List (event-triggered when mortgage statement received)

Document Processor scans the servicer name on the mortgage statement and assigns a risk level:

- **BLOCK (do not proceed with SubTo):** HomeLoanServ. CRITICAL escalate immediately to Tiffany. Stop the deal flow until decision is made.
- **CAUTION (proceed with extra care, flag in compliance):** Mr. Cooper, Rocket Mortgage, Fifth Third Bank, M&T Bank, local banks, credit unions, small banks. Add a compliance flag: "[Servicer name] is on the SubTo caution list. Higher risk of due-on-sale being called. Buyer has been notified."
- **CLEAR (proceed normally):** Anything else. Common big servicers like Chase, Wells Fargo, Bank of America without other red flags.

The list is current as of the time these skills were written. Tiffany may update over time as patterns emerge.

#### TC Boundary Notes (SubTo specific)

- TC does not draft, explain, or negotiate the SubTo Addendum or Seller Acknowledgments. The buyer (typically the client) handles all explanation and negotiation with the seller. TC only routes the documents for signature after the buyer confirms terms have been communicated.
- TC does not proactively suggest land trust as a holding option. Holding structure question presents LLC and personal as default. Land trust only engaged if buyer brings it up first.
- TC helps fill the SubTo Authorization Packet when client is in the SubTo community and using community templates. TC always sends the pre-filled version to the client for review and confirmation before passing to title. Client may also opt to have an attorney draft a custom packet (recommended for non-community deals).
- TC verifies the mortgage portal login by actually logging in (coordinating 2FA with seller in real time). This is a critical pre-close gate. Without this verification, the deal cannot advance to closing.
- TC sends the Seller Disclosure Packet via DocuSign with pre-filled fields where possible. Seller does their best to fill the rest and signs. TC does not advise on what to fill in.

### 5. Hybrid (SubTo + Seller Finance)
- All SubTo items above (including the holding structure decision, mirror docs decision, mortgage servicer watch list, mortgage portal login verification, Auth Packet flow, and conditional sub-items)
- All Seller Finance items above
- Two note/deed sets confirmed (one per component)

### 6. Wrap Dispo
- RMLO contact confirmed (`requires_rmlo: true`)
- RMLO Packet. Gate: required before closing_prep.
- Acquisition Closing Docs. Gate: required before closing_prep.
- Wrap Note + Wrap Deed of Trust
- Borrower disclosures

### 7. Novation
- Listing Agreement language check. Event-triggered when listing agreement is received. CRITICAL flag if it does not contain language preventing buyer's agent from changing title companies.
- Novation Agreement
- Acquisition contract
- End-buyer contract

### 8. Lending Deal
- Funding source confirmed. Hard block before escrow opens.
- Loan application
- Term sheet signed
- Lender contact confirmed
- (Skip Seller Disclosure Packet from universal: no seller in the traditional sense)

### 9. Loan Sponsorship
- Sponsor agreement
- Sponsor underwriting docs
- Borrower docs
- (Skip Seller Disclosure Packet from universal: no seller in the traditional sense)

### 10. Gator Lending
- EMD Loan Agreement. Gate: required before closing_prep.
- Multiple escrow instruction sets (confirm each set received separately)
- Gator note
- Collateral assignment

### 11. Morby Method (Double Close)
- Closing #1 contract
- Closing #2 contract
- Holdback / release instructions. Gate: required before closing_prep.
- Loan Docs. Gate: required before closing_prep.
- Closing #1 must be fully signed and recorded before Closing #2 is scheduled. CRITICAL hard gate.

### 12. Multi-Family
- Funding source confirmed. Hard block before escrow opens.
- Property info gathered before escrow opens (rent rolls, T-12, leases). Gate.
- Estoppels
- Service contracts inventory

---

## Post-Close Service Checklists

These attach to the existing deal file as a second phase. Do not create a new deal file.

### 13. Servicing, Seller Finance
- Servicing setup form
- Borrower payment instructions
- Late notice template
- Year-end 1098 setup

### 14. Servicing, Subject To
- Servicing setup form
- Mortgage payment routing confirmed
- Insurance payment routing confirmed
- Tax payment routing confirmed
- Underlying lender contact log

### 15. Servicing, Hybrid
- All Servicing-SF items
- All Servicing-SubTo items

### 16. After Closing SubTo
- Authorization Packet on file
- Insurance updated to buyer-as-loss-payee
- Tax mailing address updated
- Mortgage login confirmed working
- Annual underlying loan health check scheduled
