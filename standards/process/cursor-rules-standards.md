# Cursor Rules Standards v1.0

## Metadata
- **Created:** 2025-12-04
- **Last Updated:** 2025-12-04
- **Version:** 1.0
- **Description:** Standards for creating, structuring, and maintaining Cursor rules (`.cursor/rules/*.mdc` files)
- **Type:** Governing Standard - Defines requirements for Cursor rule creation
- **Applicability:** When creating or modifying Cursor rules
- **Dependencies:**
  - [environment.mdc](../../.cursor/rules/environment.mdc) - Version numbering standards for rules
  - [documentation.md](../project-planning/documentation.md) - General documentation standards

---

## 1. Purpose

Cursor rules (`.mdc` files) are automatically applied by AI agents when working in the codebase. This standard defines how to create, structure, and maintain these rules to ensure consistency and effectiveness.

---

## 2. When to Create a Rule

Create a Cursor rule when:
- ✅ **Behavior needs to apply automatically** - The behavior should trigger without user invocation
- ✅ **Pattern applies to specific file types** - Use `globs` to target specific files (e.g., `**/*.ts` for TypeScript)
- ✅ **Project-specific conventions** - Enforcing architectural decisions or coding patterns
- ✅ **Cross-cutting concerns** - Behavior that spans multiple features (e.g., linting, error handling, documentation)
- ✅ **Automated guidance** - Helping agents make consistent decisions

**Do NOT create a rule when:**
- ❌ **One-time operations** - Use a command instead (`.cursor/commands/*.md`)
- ❌ **User needs control** - If user should decide when to run it, use a command
- ❌ **Complex multi-step workflows** - Use a command with confirmation steps

---

## 3. Required Rule Structure

Every Cursor rule MUST have:

### 3.1 YAML Frontmatter (REQUIRED)
```yaml
---
description: Brief description of what this rule does (one sentence)
version: X.Y.Z (semantic versioning - see environment.mdc)
lastUpdated: YYYY-MM-DD (ISO date format)
globs: **/* (optional - file pattern this rule applies to, NO quotes)
alwaysApply: true/false (whether rule applies to all files or just matching globs)
type: Rule type (see Section 4, NO quotes)
relatedCommands: [command1.md, command2.md] (optional - related cursor commands)
relatedRules: [rule1.mdc, rule2.mdc] (optional - other rules this interacts with)
relatedStandards: [standard1.md, standard2.md] (optional - standards this rule implements)
---
```

**Field Definitions:**
- **description** (REQUIRED): One sentence summary of rule purpose
- **version** (REQUIRED): Semantic versioning (X.Y.Z format)
  - Major: Breaking changes or major behavior changes
  - Minor: New features or significant additions
  - Patch: Bug fixes, clarifications, minor updates
- **lastUpdated** (REQUIRED): Date of last modification (YYYY-MM-DD format)
- **globs** (OPTIONAL): File pattern(s) this rule applies to (NO quotes in .mdc files)
  - Examples: `**/*.ts`, `**/*.{ts,tsx}`, `**/*`
  - Omit if rule applies universally
- **alwaysApply** (REQUIRED): Whether rule applies automatically
  - `true`: Always applies (most common)
  - `false`: Only applies to matching globs
- **type** (REQUIRED): Document type (see Section 4)
- **relatedCommands** (OPTIONAL): Array of related command filenames
- **relatedRules** (OPTIONAL): Array of related rule filenames
- **relatedStandards** (OPTIONAL): Array of related standard filenames

### 3.2 Markdown Content Structure

After the YAML frontmatter:

```markdown
# Rule Title

## When This Rule Applies

[Clear description of when/where this rule triggers]

---

## Core Principle / Purpose

[High-level explanation of what this rule achieves]

---

## Agent Responsibilities / Rule Behavior

### Section 1: [First Responsibility]
[Detailed explanation with examples]

### Section 2: [Second Responsibility]
[Detailed explanation with examples]

---

## Examples

[Provide concrete examples of correct/incorrect behavior]

---

## Integration with Other Rules/Commands

[How this rule works with other rules/commands/standards]

---

## Related Files

- **Commands:** [List related commands with brief descriptions]
- **Rules:** [List related rules with brief descriptions]
- **Standards:** [List related standards with brief descriptions]

---

## How to Use This Rule

[Clear instructions for agents on how to apply this rule]

**This rule applies automatically when [condition]. Agents should [expected behavior].**
```

---

## 4. Rule Types

Every rule must declare its type in the YAML frontmatter:

### Type 1: Auto-Applied Behavioral Rule
**Purpose:** Guides agent behavior automatically
**Example:** `linting.mdc`, `ai-interaction-rules.mdc`
**YAML:**
```yaml
type: Auto-Applied Behavioral Rule - Guides AI agent behavior
alwaysApply: true
```

### Type 2: Environment/Configuration Rule
**Purpose:** Defines environment expectations and setup
**Example:** `environment.mdc`
**YAML:**
```yaml
type: Environment Configuration Rule - Defines runtime expectations
alwaysApply: true
```

### Type 3: Workflow Integration Rule
**Purpose:** Integrates with development workflow
**Example:** `task-workflow.mdc`
**YAML:**
```yaml
type: Workflow Integration Rule - Manages task lifecycle
alwaysApply: true
```

### Type 4: Project-Specific Rule
**Purpose:** Applies to specific project/codebase
**Example:** `workflow-standards-documentation-maintenance.mdc`
**YAML:**
```yaml
type: Project-Specific Rule - Applies to Workflow Rules repository only
alwaysApply: true
```

### Type 5: Conditional Rule (File-Specific)
**Purpose:** Applies only to specific files/patterns
**Example:** Rule that only applies to `.tsx` files
**YAML:**
```yaml
type: Conditional Rule - Applies to specific file types
globs: **/*.tsx
alwaysApply: false
```

### Type 6: Error Recovery Rule
**Purpose:** Handles errors and self-healing
**Example:** `auto-heal.mdc`
**YAML:**
```yaml
type: Error Recovery Rule - Automatic error detection and fixing
alwaysApply: true
```

### Type 7: Security/Compliance Rule
**Purpose:** Enforces security or compliance requirements
**Example:** `supabase-rls-policy-review.mdc`
**YAML:**
```yaml
type: Security Compliance Rule - Auto-applied when Supabase detected
alwaysApply: true
```

### Type 8: Documentation Maintenance Rule
**Purpose:** Ensures documentation stays updated
**Example:** `documentation-dependency-tracking.mdc`
**YAML:**
```yaml
type: Documentation Maintenance Rule - Tracks doc dependencies automatically
alwaysApply: true
globs: {standards/**/*.md,docs/**/*.md,.cursor/rules/*.mdc,.cursor/commands/*.md}
```

---

## 5. Rule Naming Conventions

### 5.1 Filename Format
- **Pattern:** `{purpose}-{scope}.mdc`
- **Use kebab-case:** Words separated by hyphens
- **Examples:**
  - `ai-interaction-rules.mdc`
  - `documentation-dependency-tracking.mdc`
  - `auto-heal.mdc`
  - `task-workflow.mdc`

### 5.2 Title Format
- **Title in content:** Match the purpose, use Title Case
- **Example:** `# Task Workflow Rule`

---

## 6. Version Management

### 6.1 Semantic Versioning for Rules
- **Major (X.0.0):** Breaking changes, major behavior changes
- **Minor (X.Y.0):** New features, new sections, significant additions
- **Patch (X.Y.Z):** Bug fixes, clarifications, typo fixes

### 6.2 When to Increment Version
- **Always** when modifying rule content
- **Update both:**
  - `version:` in YAML frontmatter
  - `lastUpdated:` in YAML frontmatter

### 6.3 Document Changes
- Add entry to `CHANGELOG.md` for significant rule changes
- Major version changes should include migration notes

---

## 7. Dependencies and Cross-References

### 7.1 Related Commands
List commands that:
- Implement this rule's requirements
- Are referenced by this rule
- Complement this rule's behavior

**Format in YAML:**
```yaml
relatedCommands: [pre-flight-check.md, pr-review-check.md]
```

**Format in content:**
```markdown
## Related Files
- **Commands:**
  - [pre-flight-check.md](../../.cursor/commands/pre-flight-check.md) - Implements pre-flight validation
  - [pr-review-check.md](../../.cursor/commands/pr-review-check.md) - Implements PR validation
```

### 7.2 Related Rules
List rules that:
- This rule depends on
- Interact with this rule
- Should be considered together

**Format in YAML:**
```yaml
relatedRules: [environment.mdc, auto-heal.mdc]
```

**Format in content:**
```markdown
## Related Files
- **Rules:**
  - [environment.mdc](./environment.mdc) - Defines environment expectations
  - [auto-heal.mdc](./auto-heal.mdc) - Error recovery strategies
```

### 7.3 Related Standards
List standards that:
- This rule implements
- Define requirements this rule enforces
- Provide additional context

**Format in YAML:**
```yaml
relatedStandards: [process/linting.md, documentation.md]
```

**Format in content:**
```markdown
## Related Files
- **Standards:**
  - [linting.md](../../standards/process/linting.md) - Defines linting requirements
  - [documentation.md](../../standards/project-planning/documentation.md) - Documentation standards
```

---

## 8. Best Practices for Writing Rules

### 8.1 Clarity and Specificity
- ✅ Be explicit about when the rule applies
- ✅ Use clear, actionable language
- ✅ Provide concrete examples
- ❌ Avoid vague instructions like "consider doing X"

### 8.2 Scope Management
- ✅ Each rule should have a single, clear purpose
- ✅ Use `globs` to limit rule scope when appropriate
- ❌ Don't create "mega-rules" that try to do everything

### 8.3 Integration with Other Rules
- ✅ Reference related rules explicitly
- ✅ Explain how rules interact
- ✅ Avoid contradicting other rules
- ❌ Don't duplicate behavior from other rules

### 8.4 Examples and Guidance
- ✅ Provide "Good" vs "Bad" examples
- ✅ Show concrete code examples when relevant
- ✅ Include usage scenarios
- ❌ Don't leave agents guessing about expected behavior

### 8.5 Maintainability
- ✅ Structure rules with clear sections
- ✅ Use consistent formatting
- ✅ Keep rules focused and concise
- ❌ Don't let rules grow too large (>1000 lines needs refactoring)

---

## 9. Rule Testing and Validation

### 9.1 Before Publishing a Rule
- [ ] YAML frontmatter is valid and complete
- [ ] All required fields are present
- [ ] Version follows semantic versioning
- [ ] Type is declared and accurate
- [ ] Related commands/rules/standards are listed
- [ ] Examples are provided
- [ ] "How to Use" section is clear
- [ ] Cross-references are accurate and links work

### 9.2 After Publishing a Rule
- [ ] Test rule in a sample project
- [ ] Verify rule triggers as expected
- [ ] Ensure rule doesn't conflict with other rules
- [ ] Update `CHANGELOG.md` with rule addition
- [ ] Update `AGENTS.md` if rule affects workflow

---

## 10. Common Patterns and Templates

### 10.1 Basic Rule Template
```markdown
---
description: Brief one-sentence description
version: 1.0.0
lastUpdated: 2025-12-04
alwaysApply: true
type: "Auto-Applied Behavioral Rule - Guides AI agent behavior"
relatedCommands: []
relatedRules: []
relatedStandards: []
---

# Rule Title

## When This Rule Applies

[When/where this rule triggers]

---

## Core Principle

[High-level purpose]

---

## Agent Responsibilities

### Responsibility 1
[Details]

### Responsibility 2
[Details]

---

## Examples

**Good:**
```
[Example of correct behavior]
```

**Bad:**
```
[Example of incorrect behavior]
```

---

## Related Files

- **Commands:** [List]
- **Rules:** [List]
- **Standards:** [List]

---

## How to Use This Rule

This rule applies automatically when [condition]. Agents should [expected behavior].
```

### 10.2 File-Specific Rule Template
```markdown
---
description: Brief one-sentence description
version: 1.0.0
lastUpdated: 2025-12-04
globs: "**/*.{ts,tsx}"
alwaysApply: false
type: "Conditional Rule - Applies to specific file types"
relatedCommands: []
relatedRules: []
relatedStandards: []
---

# Rule Title

## When This Rule Applies

This rule applies automatically when modifying TypeScript files (`.ts`, `.tsx`).

[Rest of content...]
```

---

## 11. Deprecation and Removal

### 11.1 Deprecating a Rule
When a rule is no longer needed:
1. Update YAML frontmatter:
   ```yaml
   description: "[DEPRECATED] Original description"
   ```
2. Add deprecation notice at top of file:
   ```markdown
   > **⚠️ DEPRECATED:** This rule is deprecated as of [date].
   > Use [alternative-rule.mdc] instead.
   > This rule will be removed in [future version].
   ```
3. Update `CHANGELOG.md`
4. Update `AGENTS.md` to remove references

### 11.2 Removing a Rule
Before removal:
- [ ] Rule has been marked deprecated for at least 1 version cycle
- [ ] All references updated to point to replacement
- [ ] Migration guide provided if needed
- [ ] `CHANGELOG.md` updated with removal notice

---

## 12. Integration with Documentation Tracking

Rules are automatically tracked by:
- **`documentation-dependency-tracking.mdc`** - Tracks rule dependencies when modified
- **`audit-documentation-metadata.md`** - Audits rule metadata completeness

When modifying a rule, agents MUST:
1. Update YAML frontmatter (version, lastUpdated)
2. Update related commands/rules/standards if changed
3. Check reverse dependencies (what references this rule)
4. Update `CHANGELOG.md`

---

## 13. Examples of Well-Structured Rules

### Example 1: Behavioral Rule (`linting.mdc`)
- ✅ Clear YAML frontmatter with all fields
- ✅ Specific "When This Rule Applies" section
- ✅ Concrete examples of expected behavior
- ✅ Integration with related commands
- ✅ "How to Use" instructions at the end

### Example 2: Workflow Rule (`task-workflow.mdc`)
- ✅ Structured by workflow phase (before, during, after)
- ✅ References related commands and checklists
- ✅ Clear integration with other rules
- ✅ Actionable checklist format

### Example 3: Conditional Rule (`documentation-dependency-tracking.mdc`)
- ✅ Uses `globs` to target specific files
- ✅ Clear "When This Rule Applies" conditions
- ✅ Detailed agent responsibilities
- ✅ Examples with scenarios

---

## 14. Related Files

- **Rules:**
  - [environment.mdc](../../.cursor/rules/environment.mdc) - Defines version numbering standards for rules
  - [documentation-dependency-tracking.mdc](../../.cursor/rules/documentation-dependency-tracking.mdc) - Auto-tracks rule dependencies
- **Commands:**
  - [audit-documentation-metadata.md](../../.cursor/commands/audit-documentation-metadata.md) - Audits rule metadata
- **Standards:**
  - [documentation.md](../project-planning/documentation.md) - General documentation standards

---

## How to Use This Standard

**When creating a new Cursor rule:**
1. Use the template from Section 10
2. Fill in all required YAML frontmatter fields
3. Follow the content structure from Section 3.2
4. Declare the rule type (Section 4)
5. List related commands, rules, and standards
6. Provide clear examples and usage instructions
7. Test the rule before publishing (Section 9)

**When modifying an existing rule:**
1. Update version and lastUpdated in YAML frontmatter
2. Update related files lists if dependencies changed
3. Check reverse dependencies (what references this rule)
4. Update `CHANGELOG.md` with changes
5. Follow `documentation-dependency-tracking.mdc` requirements

