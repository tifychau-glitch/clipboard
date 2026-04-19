#!/usr/bin/env python3
"""
delegate.py — agent-to-agent task delegation for Clipboard / Paperclip.

Usage (from inside a running agent task):
  python3 /Users/tiffanychau/Downloads/paperclip-claude/scripts/delegate.py \
    --to "CMO" --task "Write a product launch tweet thread" --from "CEO"

Guardrails enforced:
  1. Scope check    — the sender must be a direct manager of the recipient.
                      Agents cannot skip levels or delegate sideways.
  2. Loop guard     — refuses if the target agent is already in the current
                      delegation chain (prevents A→B→A cycles).
  3. Task cap       — a single invocation can delegate at most MAX_TASKS_PER_RUN
                      tasks per manager per run (default 5).
  4. Paused block   — refuses to delegate to paused agents.
  5. Audit log      — every delegation is appended to the log file below.
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

# ── Configuration ────────────────────────────────────────────────────────────

PAPERCLIP_URL = os.environ.get("PAPERCLIP_URL", "http://localhost:3100")
COMPANY_ID    = os.environ.get("PAPERCLIP_COMPANY_ID", "de3f0b6d-4be7-4d3c-8eb8-8e24a6b6da47")
MAX_TASKS_PER_RUN = int(os.environ.get("DELEGATE_MAX_TASKS", "5"))
AUDIT_LOG = os.path.join(os.path.dirname(__file__), "delegation_audit.log")

# ── Helpers ───────────────────────────────────────────────────────────────────

def api_get(path: str):
    req = urllib.request.Request(f"{PAPERCLIP_URL}/api{path}")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read())
    except urllib.error.URLError as e:
        die(f"Cannot reach Paperclip at {PAPERCLIP_URL}: {e}")

def api_post(path: str, body: dict):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{PAPERCLIP_URL}/api{path}",
        data=data,
        headers={"content-type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body_text = e.read().decode(errors="replace")
        die(f"API error {e.code}: {body_text}")

def die(msg: str):
    print(f"[delegate] ERROR: {msg}", file=sys.stderr)
    sys.exit(1)

def log_audit(entry: dict):
    entry["ts"] = datetime.now(timezone.utc).isoformat()
    with open(AUDIT_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")

# ── Guardrails ────────────────────────────────────────────────────────────────

def load_agents():
    return api_get(f"/companies/{COMPANY_ID}/agents")

def resolve_agent(agents: list, name_or_id: str):
    for a in agents:
        if a["id"] == name_or_id or a["name"].lower() == name_or_id.lower():
            return a
    available = [a["name"] for a in agents]
    die(f"Agent '{name_or_id}' not found. Available: {available}")

def check_scope(agents: list, sender: dict, target: dict):
    """Guardrail 1: sender must be a direct manager of target."""
    if target.get("reportsTo") != sender["id"]:
        direct_reports = [a["name"] for a in agents if a.get("reportsTo") == sender["id"]]
        if not direct_reports:
            die(
                f"{sender['name']} has no direct reports. "
                "Set up the org chart in Clipboard first."
            )
        die(
            f"{sender['name']} cannot delegate to {target['name']}. "
            f"{sender['name']}'s direct reports are: {direct_reports}. "
            "Agents may only delegate to their own direct reports."
        )

def check_loop(chain: list[str], target_id: str, target_name: str):
    """Guardrail 2: target must not already be in the delegation chain."""
    if target_id in chain:
        die(
            f"Delegation loop detected: {target_name} is already in the "
            f"current chain. Circular delegations are not allowed."
        )

def check_cap(sender_name: str, task_text: str):
    """Guardrail 3: count how many times this sender has delegated today and cap it."""
    if not os.path.exists(AUDIT_LOG):
        return
    today = datetime.now(timezone.utc).date().isoformat()
    # Count entries from this sender in the audit log for today.
    count = 0
    run_id = os.environ.get("PAPERCLIP_RUN_ID", "")
    with open(AUDIT_LOG) as f:
        for line in f:
            try:
                entry = json.loads(line)
                if entry.get("from") == sender_name and entry.get("ts", "").startswith(today):
                    if run_id and entry.get("run_id") == run_id:
                        count += 1
            except json.JSONDecodeError:
                pass
    if count >= MAX_TASKS_PER_RUN:
        die(
            f"{sender_name} has already delegated {count} tasks today "
            f"(cap is {MAX_TASKS_PER_RUN}). To raise the cap, set "
            "DELEGATE_MAX_TASKS env var."
        )

def check_paused(target: dict):
    """Guardrail 4: don't delegate to paused agents."""
    if target.get("status") == "paused":
        die(
            f"{target['name']} is currently paused. "
            "Resume them in Clipboard before delegating."
        )

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Delegate a task from one Clipboard agent to one of their direct reports."
    )
    parser.add_argument("--to",   required=True, help="Target agent name or ID")
    parser.add_argument("--task", required=True, help="Task prompt to send")
    parser.add_argument("--from", dest="from_agent", default=None,
                        help="Delegating agent name (omit to skip scope check)")
    parser.add_argument("--chain", default="",
                        help="Comma-separated agent IDs already in this delegation chain "
                             "(used internally to detect loops)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Validate and print without actually sending the task")
    args = parser.parse_args()

    agents = load_agents()
    target = resolve_agent(agents, args.to)

    # Parse delegation chain
    chain = [c for c in args.chain.split(",") if c]

    if args.from_agent:
        sender = resolve_agent(agents, args.from_agent)
        check_scope(agents, sender, target)
        check_cap(sender["name"], args.task)
        check_loop(chain, target["id"], target["name"])
        chain.append(sender["id"])
    else:
        # No sender specified — allow but log as unverified.
        sender = None

    check_paused(target)

    if args.dry_run:
        print(f"[delegate] DRY RUN — would send to {target['name']} ({target['id']}):")
        print(f"  Task: {args.task[:120]}{'...' if len(args.task) > 120 else ''}")
        return

    # Build the prompt — prepend delegation context so the target agent knows.
    if sender:
        prompt = (
            f"Task delegated by {sender['name']}"
            + (f" ({sender['title']})" if sender.get("title") else "")
            + f":\n\n{args.task}"
        )
    else:
        prompt = args.task

    result = api_post(f"/agents/{target['id']}/wakeup", {
        "source": "on_demand",
        "reason": f"Delegated from {sender['name'] if sender else 'unknown'} to {target['name']}",
        "payload": {
            "prompt": prompt,
            "delegatedBy": sender["id"] if sender else None,
            "delegationChain": chain,
        },
        "forceFreshSession": True,
    })

    run_id = result.get("id", "?")

    log_audit({
        "from": sender["name"] if sender else "unknown",
        "to": target["name"],
        "run_id": run_id,
        "task_preview": args.task[:200],
    })

    print(f"[delegate] Task sent to {target['name']}. Run ID: {run_id}")
    print(f"[delegate] Watch progress: http://localhost:5173/agents/{target['id']}")

if __name__ == "__main__":
    main()
