# audit-readmes

## Metadata
- **Status:** Active
- **Created:** 12-04-2025 12:03:35 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** Validates all README.md files against readme-standards.mdc requirements. Identifies missing sections, broken links, placeholder text, and structural issues.
- **Type:** Executable Command
- **Audience:** AI agents performing documentation audits
- **Applicability:** Run periodically or before major releases to ensure README quality, after module addition, during documentation cleanup, or before onboarding new developers
- **How to Use:** Run this command to audit all README files and generate a report of issues
- **Dependencies:** None
- **Related Cursor Commands:** [audit-docs.md](./audit-docs.md), [audit-documentation-rules-metadata.md](./audit-documentation-rules-metadata.md)
- **Related Cursor Rules:** [readme-standards.mdc](../rules/readme-standards.mdc), [documentation-metadata.mdc](../rules/documentation-metadata.mdc)
- **Related Standards:** [project-planning/documentation.md](../../standards/project-planning/documentation.md), [module-structure.md](../../standards/module-structure.md)

---

## Purpose

This command validates all README.md files in the repository against the standards defined in `.cursor/rules/readme-standards.mdc`. It identifies missing sections, broken links, placeholder text, and structural issues.

---

## When to Run

- **Periodic Review:** Monthly or quarterly README quality check
- **Before Releases:** Ensure all documentation is complete before major releases
- **After Module Addition:** Validate new module READMEs follow standards
- **Documentation Cleanup:** When updating or refactoring documentation
- **Onboarding Preparation:** Before sharing repository with new developers

---

## Execution Steps

### Step 1: Find All README Files

```bash
# Find all README.md files (excluding node_modules)
find . -name "README.md" -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -not -path "*/build/*"
```

**Expected Result:** List of all README.md file paths

---

### Step 2: Categorize Each README by Type

For each README file, determine its type based on location:

**Type Detection Rules:**
- `./README.md` → **Root README** (Project Overview)
- `./modules/*/README.md` → **Module README** (Usage Guide)
- `./standards/README.md` or `./standards/*/README.md` → **Standards README** (Navigation Guide)
- All other locations → **Feature/Tool README** (Documentation)

**Output Format:**
```
📄 ./README.md [Root README]
📄 ./modules/backend-api/README.md [Module README]
📄 ./standards/README.md [Standards README]
📄 ./docs/feature-x/README.md [Feature/Tool README]
```

---

### Step 3: Validate Required Sections by Type

For each README, check for required sections based on type:

#### Root README Required Sections
- [ ] Title and brief description (1-2 sentences)
- [ ] Purpose section (📚 emoji recommended)
- [ ] Directory layout (🗂️ emoji recommended, visual tree structure)
- [ ] How to use section (🚀 emoji recommended)
- [ ] AI agent instructions (🤖 emoji recommended)
- [ ] No placeholder text (TODO, Coming soon, etc.)

#### Module README Required Sections
- [ ] Title and brief description (1 sentence)
- [ ] Features list with checkmarks (✅)
- [ ] Dependencies section with versions
- [ ] Installation section with copy commands
- [ ] Usage section with at least one example
- [ ] Code examples include imports and comments
- [ ] Related documentation links
- [ ] No placeholder text

#### Standards README Required Sections
- [ ] Metadata section (Status, Created, Last Updated, Version, Description)
- [ ] Purpose section
- [ ] Organization section (how standards are structured)
- [ ] Usage section (for developers and AI agents)
- [ ] Related documentation links
- [ ] Quick navigation by task
- [ ] No placeholder text

#### Feature/Tool README Required Sections
- [ ] Title and description
- [ ] Overview or Purpose section
- [ ] Features or Capabilities section
- [ ] Usage instructions
- [ ] Related documentation links
- [ ] No placeholder text

---

### Step 4: Validate Links

For each README:
1. Extract all markdown links: `[text](path)`
2. For relative links, verify file exists at path
3. For absolute links, note for manual review
4. Report broken links

**Link Validation:**
```bash
# Extract links from README (basic regex)
grep -o '\[.*\]([^)]\+)' README.md

# For each relative link, check if file exists
# Example: [Module](./modules/module-name/README.md)
# Check: test -f ./modules/module-name/README.md
```

**Report Format:**
```
❌ Broken link in ./modules/backend-api/README.md
   Line 27: [Standard](./standards/missing-file.md) → File not found

✅ All links valid in ./README.md
```

---

### Step 5: Check for Quality Issues

For each README, check:

#### Placeholder Text
Search for common placeholders:
- `TODO`
- `Coming soon`
- `TBD`
- `FIXME`
- `[PLACEHOLDER]`
- `...` (ellipsis indicating incomplete content)

#### Vague Descriptions
Detect potentially vague content:
- Title or first paragraph < 10 characters
- Generic phrases like "This is a module for X" without details
- Missing concrete examples in module READMEs

#### Code Examples
For Module READMEs:
- Check if Usage section has code blocks (```typescript or ```bash)
- Verify code examples include imports
- Check if examples are commented

---

### Step 6: Generate Audit Report

Create a comprehensive report with:
1. **Summary Statistics**
2. **Issues by Severity** (Critical, Warning, Info)
3. **README-Specific Issues**
4. **Recommendations**

---

## Report Format

### Summary Statistics

```
README Audit Report
Generated: 2025-12-04 12:00:00 EST

📊 Summary:
- Total READMEs: 19
- Root READMEs: 1
- Module READMEs: 16
- Standards READMEs: 1
- Feature/Tool READMEs: 1

✅ Fully Compliant: 12
⚠️  Has Warnings: 5
❌ Has Critical Issues: 2
```

### Issues by Severity

#### Critical Issues (Must Fix)
```
❌ ./modules/new-module/README.md [Module README]
   - Missing required section: Features
   - Missing required section: Dependencies
   - Missing required section: Installation
   - No code examples in Usage section

❌ ./docs/feature-x/README.md [Feature/Tool README]
   - Missing required section: Usage instructions
   - Broken link: [Guide](./missing-guide.md)
```

#### Warnings (Should Fix)
```
⚠️  ./modules/logger-module/README.md [Module README]
   - Broken link: [Standard](./standards/old-file.md)
   - Placeholder text found: "TODO: Add more examples"

⚠️  ./standards/README.md [Standards README]
   - Last Updated is older than 6 months (consider review)
```

#### Info (Nice to Have)
```
ℹ️  ./modules/backend-api/README.md [Module README]
   - Could benefit from "How It Works" section
   - Consider adding "Troubleshooting" section

ℹ️  ./README.md [Root README]
   - Consider adding version badge
```

### README-Specific Details

For each README with issues:

```
📄 ./modules/new-module/README.md [Module README]

Missing Required Sections:
❌ Features list with checkmarks (✅)
❌ Dependencies section with versions
❌ Installation section with copy commands

Quality Issues:
⚠️  Description is too vague: "This module helps with X"
⚠️  No code examples found in Usage section

Recommendations:
1. Add Features section with ✅ checkmarks
2. Add Dependencies section listing all npm packages
3. Add Installation section with `cp` and `npm install` commands
4. Provide concrete code example with imports in Usage section
5. Improve description: explain what the module does specifically

Reference: .cursor/rules/readme-standards.mdc (Module README Structure)
```

### Recommendations Summary

```
📋 Overall Recommendations:

High Priority (Fix Now):
1. Fix 2 READMEs with missing required sections
2. Fix 3 broken links across all READMEs
3. Remove placeholder text from 2 READMEs

Medium Priority (Fix Soon):
4. Add code examples to 5 module READMEs
5. Improve vague descriptions in 3 READMEs
6. Update metadata in 2 standards READMEs

Low Priority (Consider):
7. Add optional "How It Works" sections to complex modules
8. Add troubleshooting sections to frequently-used modules
9. Consider adding version badges to root README
```

---

## Validation Checklist

After running audit, verify:

- [ ] All README files have been found and categorized
- [ ] Each README has been checked for required sections
- [ ] All links have been validated
- [ ] Placeholder text has been identified
- [ ] Report includes severity levels (Critical, Warning, Info)
- [ ] Recommendations are actionable and specific
- [ ] Report saved to file or displayed in console

---

## Example Usage

### Run Full Audit

```bash
# AI Agent: Run the audit command
# Expected: Generate full audit report

# 1. Find all READMEs
find . -name "README.md" -not -path "*/node_modules/*"

# 2. For each README, validate structure and content
# 3. Generate report with issues and recommendations
# 4. Output to console or save to ./logs/readme-audit-YYYY-MM-DD.txt
```

### Audit Specific Directory

```bash
# Audit only module READMEs
find ./modules -name "README.md"

# Audit only standards READMEs
find ./standards -name "README.md"
```

### Quick Check (Summary Only)

```bash
# Show only summary statistics and critical issues
# Skip detailed per-file analysis
```

---

## Output Options

### Console Output (Default)
Display report in terminal with colors:
- ✅ Green for compliant
- ⚠️  Yellow for warnings
- ❌ Red for critical issues

### File Output
Save report to:
- `./logs/readme-audit-YYYY-MM-DD-HH-MM-SS.txt` - Full report
- `./logs/readme-audit-summary.txt` - Latest summary (overwrite)

### JSON Output
For programmatic processing:
```json
{
  "timestamp": "2025-12-04T12:00:00Z",
  "summary": {
    "total": 19,
    "compliant": 12,
    "warnings": 5,
    "critical": 2
  },
  "issues": [
    {
      "file": "./modules/new-module/README.md",
      "type": "Module README",
      "severity": "critical",
      "issues": [
        "Missing required section: Features",
        "Missing required section: Dependencies"
      ]
    }
  ]
}
```

---

## Integration with Other Commands

### After Module Creation
After creating a new module, run README audit to ensure compliance:
```bash
# 1. Create module structure
# 2. Generate module README from template
# 3. Run: audit-readmes (validate new README)
# 4. Fix any issues before committing
```

### Before PR
Include README audit in PR review checklist:
```bash
# pr-review-check.md already includes documentation check
# This command provides detailed README validation
```

### Periodic Maintenance
Run monthly or quarterly to catch documentation drift:
```bash
# 1. Run: audit-readmes
# 2. Review warnings and recommendations
# 3. Update outdated READMEs
# 4. Fix broken links
# 5. Commit improvements
```

---

## Success Criteria

Audit is successful when:
- [ ] All README files identified and categorized correctly
- [ ] Required sections validated for each type
- [ ] All links checked (relative paths verified)
- [ ] Placeholder text identified
- [ ] Report generated with actionable recommendations
- [ ] Critical issues clearly highlighted
- [ ] Report saved (if file output enabled)

---

## Troubleshooting

### No READMEs Found
**Issue:** `find` command returns no results  
**Solution:** Check current directory, verify you're in project root

### False Positives on Links
**Issue:** Valid links reported as broken  
**Solution:** Check if link uses absolute path or external URL (should be noted for manual review)

### Missing Categorization
**Issue:** README type not detected correctly  
**Solution:** Update type detection rules in Step 2 for edge cases

### Performance Issues
**Issue:** Audit takes too long for large repositories  
**Solution:** Limit scope to specific directories or use parallel processing

---

## Related Files

- **Rules:**
  - [readme-standards.mdc](../../.cursor/rules/readme-standards.mdc) - README structure standards
  - [documentation-metadata.mdc](../../.cursor/rules/documentation-metadata.mdc) - Metadata requirements
- **Commands:**
  - [pr-review-check.md](./pr-review-check.md) - Includes documentation validation
  - [project-audit.md](./project-audit.md) - Overall project structure audit
- **Standards:**
  - [documentation.md](../../standards/project-planning/documentation.md) - Documentation management
  - [module-structure.md](../../standards/module-structure.md) - Module requirements

---

## Notes

- This command validates structure and content, not technical accuracy
- Links to external URLs are noted for manual review (not validated)
- Metadata requirements apply only to Standards READMEs
- Module READMEs should focus on usage, not implementation details
- Consider running after major documentation refactoring
- Report can be version controlled in `./logs` for historical tracking

---

## Automation Potential

This command can be automated as:
1. **Pre-commit Hook:** Validate changed READMEs before commit
2. **CI/CD Check:** Run as part of pull request validation
3. **Scheduled Job:** Weekly or monthly automated audit with email report
4. **IDE Integration:** Real-time validation as README is edited

---

*This command ensures all README files maintain high quality and follow consistent standards, improving repository documentation and developer experience.*

