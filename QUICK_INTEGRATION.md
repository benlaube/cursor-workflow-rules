# Quick Integration Reference

**For AI Agents:** Use this as a quick reference when integrating this repository into a new project.

## One-Command Setup (Copy Files)

```bash
# From the new project root, assuming this repo is cloned or accessible:
cp -r /path/to/workflow-standards/.cursor .cursor
cp -r /path/to/workflow-standards/checklists checklists
cp /path/to/workflow-standards/AGENTS.md AGENTS.md
cp /path/to/workflow-standards/CHANGELOG.md CHANGELOG.md
```

## Verification Checklist

After copying, verify:

```bash
# Check rules exist
ls .cursor/rules/        # Should show: ai-interaction-rules.md, environment.mdc, self_healing.mdc, task_workflow.mdc

# Check commands exist
ls .cursor/commands/     # Should show: launch.mdc, security-audit.mdc, verify-access-control.mdc

# Check checklists exist
ls checklists/           # Should show: pre-flight-check.md, pr-review-check.md, etc.
```

## Required Adaptations

1. **AGENTS.md** - Fill in project mission, phase, and architecture
2. **.cursor/rules/environment.mdc** - Verify ports and stack match
3. **.cursor/commands/launch.mdc** - Verify startup process matches

## Test Integration

Ask the AI agent:
> "What rules are currently active? Show me the environment rules."

The agent should reference `.cursor/rules/environment.mdc`.

---

**Full instructions:** See [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md)

