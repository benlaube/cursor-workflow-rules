# Quick_Integration_Reference_v1.0

## Metadata
- **Created:** 2025-11-25
- **Last Updated:** 2025-11-25
- **Version:** 1.0
- **Description:** Quick reference guide for AI agents when integrating this repository into a new project.

## One-Command Setup (Copy Files)

```bash
# From the new project root, assuming this repo is cloned or accessible:
cp -r /path/to/workflow-standards/.cursor .cursor
cp -r /path/to/workflow-standards/docs/process docs/process
cp /path/to/workflow-standards/templates/general/AGENTS-TEMPLATE.md AGENTS.md
cp /path/to/workflow-standards/CHANGELOG.md CHANGELOG.md
```

## Verification Checklist

After copying, verify:

```bash
# Check rules exist
ls .cursor/rules/        # Should show: ai-interaction-rules.md, environment.mdc, self-healing.mdc, task-workflow.mdc

# Check commands exist
ls .cursor/commands/     # Should show: launch.mdc, security-audit.mdc, verify-access-control.mdc

# Check checklists exist
ls standards/development-checklists/  # Should show: pre-flight-checklist.md, pr-review-checklist.md, project-audit-checklist.md
```

## Required Adaptations

1. **AGENTS.md** (copied from templates/general/AGENTS-TEMPLATE.md) - Fill in project mission, phase, and architecture
2. **.cursor/rules/environment.mdc** - Verify ports and stack match
3. **.cursor/commands/launch.mdc** - Verify startup process matches

## Test Integration

Ask the AI agent:
> "What rules are currently active? Show me the environment rules."

The agent should reference `.cursor/rules/environment.mdc`.

---

**Full instructions:** See [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md)

