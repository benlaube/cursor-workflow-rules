# validate-rule-metadata

## Metadata
- **Status:** Active
- **Created:** 12-04-2025 13:57:09 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** Validates that all Cursor rule files have complete, accurate YAML frontmatter metadata according to the standards defined in cursor-rule-creation.mdc
- **Type:** Executable Command
- **Audience:** AI agents and developers performing rule metadata validation
- **Applicability:** When auditing rule files or before committing rule changes, during rule audits, when setting up a new project, after modifying existing rules, or as part of periodic documentation maintenance
- **How to Use:** Run this command to validate metadata completeness in all rule files
- **Dependencies:** None
- **Related Cursor Commands:** [audit-documentation-rules-metadata.md](./audit-documentation-rules-metadata.md), [audit-command-metadata.md](./audit-command-metadata.md)
- **Related Cursor Rules:** [cursor-rule-creation.mdc](../rules/cursor-rule-creation.mdc)
- **Related Standards:** [process/cursor-rules-standards.md](../../standards/process/cursor-rules-standards.md)

---

## Purpose

Validate that all Cursor rule files (`.mdc` files in `.cursor/rules/` directories) have complete, accurate YAML frontmatter metadata according to the standards defined in `cursor-rule-creation.mdc`.

---

## When to Use

- Before committing rule changes
- During rule audits
- When setting up a new project
- After modifying existing rules
- As part of periodic documentation maintenance

---

## Prerequisites

- [ ] Git repository with `.cursor/rules/` directory
- [ ] Rule files exist (`.mdc` files)

---

## Steps

### Step 1: Locate All Rule Files

Find all `.mdc` files in `.cursor/rules/` directories (including nested):

```bash
find . -type f -path "*/.cursor/rules/*.mdc" -o -path "*/.cursor/rules/**/*.mdc"
```

### Step 2: For Each Rule File, Validate YAML Frontmatter

Check that YAML frontmatter exists and contains all required fields:

**Required fields (in order):**
1. `description` - 1-3 sentences explaining what rule does and when to apply
2. `version` - X.Y.Z format (semantic versioning)
3. `lastUpdated` - DD-MM-YYYY HH:MM:SS EST format
4. `globs` - File pattern or empty string "" (REQUIRED)
5. `alwaysApply` - true or false
6. `type` - One of 8 standard types (NO quotes)
7. `relatedCommands` - Array of command filenames (optional)
8. `relatedRules` - Array of rule filenames (optional)
9. `relatedStandards` - Array of standard paths (optional)

**For detailed field requirements and examples, see `.cursor/rules/cursor-rule-creation.mdc` Section 2.**

### Step 3: Validate Field Formats

For each required field, verify format:

- **description:** Check length (1-3 sentences), clarity, includes when to apply
- **version:** Check semantic versioning format (X.Y.Z)
- **lastUpdated:** Check date format (DD-MM-YYYY HH:MM:SS EST)
- **globs:** Check present (even if empty string "")
- **alwaysApply:** Check boolean (true/false)
- **type:** Check matches one of 8 standard types from `cursor-rules-standards.md` Section 4
- **related fields:** Check format (arrays, filenames only, no full paths)

### Step 4: Validate Content Structure

Check that rule file includes all required sections:
- [ ] "When This Rule Applies" section
- [ ] "Core Principle" or "Purpose" section
- [ ] "Agent Responsibilities" or "Rule Behavior" section
- [ ] "Examples" section (at least one good example)
- [ ] "Related Files" section
- [ ] "How to Use This Rule" section

**For complete content structure requirements, see `.cursor/rules/cursor-rule-creation.mdc` Section 2.**

### Step 5: Report Issues

For each rule file, report:
- ✅ Pass: All metadata complete and valid
- ⚠️ Warning: Optional fields missing or formatting issues
- ❌ Fail: Required fields missing or invalid format

---

## Expected Output

### Success Case
```
✅ Rule Metadata Validation Complete

Files validated: 15
- Passed: 14
- Warnings: 1 (cursor-rule-creation.mdc - missing relatedCommands)
- Failed: 0

All required metadata fields are present and valid.
```

### Failure Case
```
❌ Rule Metadata Validation Failed

Files validated: 15
- Passed: 12
- Failed: 3

Issues found:

.cursor/rules/example-rule.mdc:
  ❌ Missing required field: globs
  ❌ Invalid version format: "1" (should be X.Y.Z)
  ❌ Wrong date format: "2025-12-04" (should be DD-MM-YYYY HH:MM:SS EST)
  ⚠️ Description too vague (doesn't say when to apply)

.cursor/rules/another-rule.mdc:
  ❌ Missing required field: alwaysApply
  ❌ Type has quotes (should not have quotes in .mdc files)

Fix these issues before committing. See .cursor/rules/cursor-rule-creation.mdc Section 2 for requirements.
```

---

## Validation

After running this command:

- [ ] All rule files have complete YAML frontmatter
- [ ] All required fields are present
- [ ] All field formats are correct
- [ ] No validation errors reported
- [ ] Any warnings are documented or addressed

---

## Common Issues

**Issue 1: Missing YAML Frontmatter**
- **Symptom:** File has no `---` delimited block at top
- **Fix:** Add complete YAML frontmatter (see `cursor-rule-creation.mdc` Section 2)

**Issue 2: Wrong Date Format**
- **Symptom:** Date is `2025-12-04` or `12/04/2025`
- **Fix:** Use `DD-MM-YYYY HH:MM:SS EST` format (e.g., `04-12-2025 13:57:09 EST`)

**Issue 3: Missing globs Field**
- **Symptom:** globs field not present
- **Fix:** Add `globs: ""` (if alwaysApply: true) or `globs: pattern` (if alwaysApply: false)

**Issue 4: Quotes in YAML**
- **Symptom:** `type: "Rule Type"` or `globs: "pattern"`
- **Fix:** Remove quotes: `type: Rule Type` and `globs: pattern`

**Issue 5: Vague Description**
- **Symptom:** Description doesn't say when rule applies
- **Fix:** Add "Applies when..." to description

---

## Related Files

- **Commands:**
  - [audit-documentation-rules-metadata.md](./audit-documentation-rules-metadata.md) - Orchestrates comprehensive metadata validation
- **Rules:**
  - [cursor-rule-creation.mdc](../rules/cursor-rule-creation.mdc) - **Complete metadata requirements and examples** (Section 2)
  - [cursor-command-creation.mdc](../rules/cursor-command-creation.mdc) - Command metadata requirements
- **Standards:**
  - [cursor-rules-standards.md](../../standards/process/cursor-rules-standards.md) - Governing standard for rule creation (Section 3)
  - [documentation.md](../../standards/project-planning/documentation.md) - General documentation standards

---

## Notes

- **This command validates metadata only** - For complete rule creation guidance, see `cursor-rule-creation.mdc`
- **Reference, don't duplicate** - This command references the comprehensive requirements in the rule file
- **Field order matters** - YAML frontmatter fields should follow the order defined in `cursor-rule-creation.mdc`
- **Get current timestamp** - Use `TZ=America/New_York date "+%d-%m-%Y %H:%M:%S EST"` for lastUpdated field
- **Single source of truth** - `cursor-rule-creation.mdc` Section 2 is the authoritative source for metadata requirements

