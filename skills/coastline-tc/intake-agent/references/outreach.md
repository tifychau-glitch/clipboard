# Intake Outreach: SA Send + Bundles A, B, C

## Tone Rules (read first)

- Warm, professional, confident.
- Recap what is being sent and why, briefly. Don't be cold.
- Share experience using these phrases: "typically," "in the past I've seen," "I've had investors do," "what I usually see is."
- Never advise, explain document mechanics, or negotiate.
- For deal-structure questions, route back to the buyer.
- No em dashes. Use periods, commas, colons, or parentheses instead.
- Never use placeholder brackets like `[Client First Name]` in the final draft. If a variable is unknown, surface it as an escalation, do not send.

---

## SA Send (Pre-Bundle, fired BEFORE deal file is created)

**When:** Tiffany has reviewed the intake form and approved + set the price. SA pre-filled.
**Recipient:** Client (buyer / investor).
**Purpose:** Get the SA signed. This is the absolute gate. Nothing else happens until this is signed.

### Template

> Subject: Welcome to Coastline TC, Service Agreement for [Property Address]
>
> Hi [Client First Name],
>
> Excited to coordinate this transaction with you. I've attached the Service Agreement for [Property Address], pre-filled with the basics. Please review, sign, and return at your earliest convenience.
>
> Once it's signed, I'll get the deal file set up and start working through the next steps. I'll be in touch right after with the rest of the kickoff (initial doc requests, escrow coordination, EMD wire instructions once we have them verified).
>
> Let me know if you have any questions on the agreement.
>
> [Tiffany / Coastline TC]

### Variables to populate
- Client first name
- Property address

### Attachments
- Pre-filled Service Agreement

---

## Bundle A: Initial Doc Requests + Welcome (after SA signed)

**Recipient:** Client (buyer / investor).
**Tone:** Warm, professional. Builds on the rapport already established by the SA send.
**Purpose:** Kick off the post-SA workflow. Request initial buyer-side docs. Note that EMD wire instructions are coming separately once verified with title.

### Pre-step

Before drafting Bundle A, verify the SA is signed and on file.

### Template

> Subject: [Property Address], next steps now that we're rolling
>
> Hi [Client First Name],
>
> Thanks for signing the agreement. We're officially rolling on [Property Address].
>
> A few buyer-side items I'll need from you in the next few days:
>
> 1. TC Info Sheet (attached)
> 2. LLC operating agreement (if buying through an entity)
> 3. Any signed contracts or addendums you already have
>
> On EMD: I'm coordinating with title to get wire instructions confirmed (I always verify those verbally with title before sending them on, just to keep wire fraud off the table). I'll send you the verified wire instructions as soon as title responds, along with the EMD amount and the wire deadline.
>
> I'll send daily status updates so you always know where we stand. For routine updates, do you prefer email or text?
>
> [Tiffany / Coastline TC]

### Variables
- Client first name
- Property address

### Attachments
- TC Info Sheet

---

## Bundle B: Introduction to Seller or Listing Agent

**Recipient:** Listing agent OR seller directly, depending on `seller_contact_preference`.
**Tone:** Clear, warm, plain language.
**Purpose:** Open the line of communication and recap what's coming. Reinforce that the buyer has already discussed structure with the seller, so we're just facilitating signatures.

### Routing

- `seller_contact_preference: through_agent` → address listing agent. Use the agent template.
- `seller_contact_preference: direct_seller` → address seller directly. Use the seller template.

### Template, Listing Agent

> Subject: [Property Address], Coordinating with Coastline TC
>
> Hi [Agent First Name],
>
> [Client name] is the buyer on [Property Address] and has hired me as the transaction coordinator. I'll be your point of contact for paperwork, timeline, and closing logistics.
>
> A few quick items to get us started:
>
> 1. Confirm the escrow / title company you're using and the officer assigned (if it's not already on the purchase agreement)
> 2. Send over the executed contract and any addendums
> 3. I'll be sending the seller a few items over the coming weeks (mortgage statement, insurance dec, signature on a few docs); let me know your preferred routing
>
> Typically I send daily status updates throughout the file so all parties stay in the loop. Looking forward to a smooth one. Reach out anytime.
>
> [Tiffany / Coastline TC]

### Template, Direct Seller

> Subject: [Property Address], Hi from Coastline TC
>
> Hi [Seller First Name],
>
> [Client name] is purchasing [Property Address] from you and has hired me as the transaction coordinator. I'll be your point of contact for paperwork and timing as we work toward closing.
>
> Over the next few weeks I'll be sending over a few documents for your signature. Typically these include an addendum that recaps the structure of the deal you and [client name] have already discussed, plus a few acknowledgment forms and a longer property disclosure packet. I'll send each one with a short note explaining what it is and why we need it, so nothing feels like it's coming out of nowhere.
>
> A few things I'll need from you over the next few weeks:
>
> 1. Most recent mortgage statement
> 2. Insurance declaration page
> 3. Signatures on the documents above as they come through (I'll send them via DocuSign with as much pre-filled as I can, to make it easy)
>
> If anything feels unclear along the way, just ask. For anything specific to how the deal itself is structured, I'll loop [client name] in since they're the one who set the terms with you.
>
> [Tiffany / Coastline TC]

### Variables
- Agent or seller first name
- Property address
- Client name

---

## Bundle C: Open Escrow + File Coordination (INCLUDES wire request)

**Recipient:** Varies by route (see below).
**Tone:** Peer-to-peer if going to escrow. Warm and clear if going to client.
**Purpose:** Establish the escrow file, request file number + title search ETA, AND request wire instructions for EMD in the same email. Compressing the EMD timeline is critical because EMD submission is the catalyst for title to start pulling commitment. Target: EMD submitted within 3 days of escrow opening.

### Routing

Two variants based on what's known at intake:

**Variant 1 (default): Escrow / Title is on the purchase agreement.**
Send to escrow officer and title officer directly. Open the file, request file number, request title search ETA.

**Variant 2 (fallback): Escrow / Title not yet selected.**
Send to client, asking them to confirm escrow/title selection. Once the client responds, populate frontmatter and queue Bundle C Variant 1.

### Template, Variant 1 (to Escrow Officer)

> Subject: New file, [Property Address], [Buyer Name] / [Seller Name]
>
> Hi [Escrow Officer First Name],
>
> Opening a file with you on [Property Address]. Buyer is [Client name], seller is [Seller name]. Transaction type: [plain-English description, see special cases below].
>
> Please confirm:
>
> 1. File number
> 2. Title search ordered + ETA on commitment
> 3. Wire instructions for EMD (so we can get [Client first name] funded ASAP and you can start pulling title)
> 4. Anything you need from us upfront
>
> I'll verbally verify the wire instructions with you by phone before passing to the buyer (just a fraud-prevention step). Loop in your title officer if separate.
>
> Thanks,
> [Tiffany / Coastline TC]

### Template, Variant 2 (to Client)

> Subject: [Property Address], Quick question on escrow / title
>
> Hi [Client First Name],
>
> Quick one. I don't see an escrow or title company listed on the purchase agreement for [Property Address]. Have you and the seller agreed on one yet?
>
> Typically the buyer and seller agree on this together (often at the time the contract is signed). Once you let me know who's handling it, I'll reach out to them directly and get the file open on our end.
>
> If you'd like a recommendation in your area, happy to share names of escrow/title companies I've worked with on similar deals.
>
> [Tiffany / Coastline TC]

### Variables
- Escrow officer first name (Variant 1)
- Client first name (Variant 2)
- Property address
- Buyer name
- Seller name
- Transaction type (use plain-English description, not internal code)

### Special cases (Variant 1 body additions)

- **Subject To, Hybrid, Wrap, Morby, Gator:** "Heads up, this is a [SubTo / Wrap / Morby / Gator] file, so there will be additional documents and a non-standard close. I've coordinated several of these and can walk through specifics anytime if helpful."
- **Novation:** "This is a novation. Please confirm the listing agreement language permits buyer's agent retention of this title company."
- **Multi-Family:** "Multi-family deal. I'll send rent rolls, T-12, and estoppels separately as they come in."

---

## When to Skip a Bundle

- **SA Send:** never skipped. Absolute gate.
- **Bundle A:** never skipped after SA signed.
- **Bundle B:** skip only if `lead_type: Other` and no seller-side coordination is required (rare).
- **Bundle C:** never skipped. Either Variant 1 or Variant 2 always goes out.

---

## Universal Formatting

- Subject lines: never vague. Always include property address. Use a comma instead of an em dash.
- Sign-offs: `[Tiffany / Coastline TC]`, single line, no logo block, no signature image at draft stage.
- Attachments: reference by name in body. Communication Agent handles actual attachment.
- No em dashes in body text. Use periods, commas, colons, or parentheses.
- No exclamation points except at closing day.
