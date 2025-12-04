# Roadmap_Standard_v1.0

## Metadata
- **Status:** Active
- **Created:** 04-12-2025
- **Last Updated:** 04-12-2025 15:45:00 EST
- **Version:** 1.0
- **Description:** Standard for creating and maintaining project roadmaps
- **Type:** Governing Standard - Defines requirements for project roadmap creation
- **Applicability:** When creating or updating project roadmaps
- **Dependencies:**
  - [documentation.md](./documentation.md) - Documentation management standards
  - [documentation-standards.md](./documentation-standards.md) - Documentation requirements
- **How to Use:** Reference this standard when creating new roadmaps or updating existing ones

## When to Apply This Standard

Apply this standard when:
- Starting a new project that needs planning and goal tracking
- Defining quarterly or yearly priorities
- Tracking milestones and completed work
- Communicating project vision to stakeholders
- Onboarding new team members to project goals

---

## 1. Overview

A project roadmap is a high-level strategic document that outlines project goals, priorities, and milestones over time. It serves as:
- **Vision Document:** Communicates long-term goals and direction
- **Planning Tool:** Organizes work into phases and priorities
- **Progress Tracker:** Records completed milestones and outstanding work
- **Communication Tool:** Aligns team and stakeholders on priorities

**Key Principle:** Roadmaps are living documents that evolve as projects progress.

---

## 2. File Location and Naming

### 2.1 Location
- **Primary Location:** `docs/roadmap/` directory (if multiple versions)
- **Alternative:** `docs/Roadmap_vX_X.md` (if single roadmap at root level)

### 2.2 Naming Convention
- **Format:** `roadmap_v{X}_{Y}.md`
- **Example:** `roadmap_v1_0.md`, `roadmap_v1_1.md`
- **Version:** Use semantic versioning (X.Y)
  - **Major (X):** Significant strategy changes or new phases
  - **Minor (Y):** Updates to status, new milestones, minor adjustments

### 2.3 Version Strategy
- **Create new version** when:
  - Quarter/phase completes
  - Major priorities shift
  - Strategy changes significantly
- **Update existing version** when:
  - Marking items complete
  - Adding minor backlog items
  - Updating status/dates

---

## 3. Required Metadata

Every roadmap must begin with:

```markdown
# Project_Roadmap_vX.Y

## Metadata
- **Created:** DD-MM-YYYY
- **Last Updated:** DD-MM-YYYY
- **Version:** X.Y
- **Description:** High-level project roadmap outlining [what it covers]. Status: [Active|Superseded by vX.Y]
```

### 3.1 Status Values
- **Active:** Current roadmap in use
- **Superseded by vX.Y:** Replaced by newer version (keep for history)
- **Archived:** No longer relevant (moved to `docs/archive/`)

---

## 4. Required Sections

### 4.1 High-Level Goals (REQUIRED)
**Purpose:** State the overarching goals (usually 3-5 major objectives)

```markdown
## High-Level Goals
1. **Foundation:** Establish a stable, self-healing dev environment.
2. **Core Product:** Build the User Dashboard and Marketing Site.
3. **Growth:** Implement the AI Content Engine.
```

**Guidelines:**
- Keep goals broad and strategic
- Use action-oriented language
- Limit to 3-5 goals
- Make goals measurable when possible

### 4.2 Time-Based Priorities (REQUIRED)
**Purpose:** Break work into time periods (quarters, phases, sprints)

```markdown
## Q4 2025 Priorities

### 1. Infrastructure (Foundation)
- [x] **Standardize Repo:** implement `cursor-workflow-rules`. *(Completed: 2025-11-18)*
- [x] **Auth System:** Setup Supabase Auth & Profile Sync. *(Completed: 2025-01-27)*
- [ ] **CI/CD:** GitHub Actions for automated testing. *(Status: Pending)*

### 2. MVP Features (Core Product)
- [ ] **Marketing Site:** Landing page with value prop. *(Status: Pending)*
- [ ] **User Dashboard:** Auth protected route. *(Status: Pending)*
```

**Guidelines:**
- Use checkbox format `- [ ]` or `- [x]`
- Group by theme/category
- Include completion dates for finished items
- Mark status for pending items
- Add brief descriptions

### 4.3 Recent Milestones (RECOMMENDED)
**Purpose:** Document what was accomplished in this version

```markdown
## Recent Milestones (v1.0 → v1.1)

### Completed in v1.1
1. **Backend API Module** - Complete implementation with Supabase SSR integration *(2025-01-27 08:30:00)*
2. **Auth System Enhancements** - Email verification, OAuth, and MFA support *(2025-01-27 09:30:00)*
```

**Guidelines:**
- List major completions with timestamps
- Group related work together
- Use descriptive names
- Include completion dates

### 4.4 Outstanding Work (RECOMMENDED)
**Purpose:** Summarize remaining work by priority

```markdown
## Outstanding Work

### High Priority
- [ ] **CI/CD Pipeline** - GitHub Actions for automated testing *(Status: Pending, Priority: High)*

### Medium Priority
- [ ] **Subscription System** - Stripe integration *(Status: Pending, Priority: Medium)*

### Low Priority / Future
- [ ] Rate limiting middleware *(Status: Backlog)*
```

**Guidelines:**
- Organize by priority levels
- Include status and priority in description
- Keep high priority list focused (3-5 items max)

### 4.5 Future Ideas / Backlog (OPTIONAL)
**Purpose:** Capture ideas not yet committed to

```markdown
## Future Ideas (Backlog)
*Ideas we are considering but haven't committed to.*
- Mobile App (React Native).
- Multi-tenant team accounts.
- Voice interface for the agent.
```

**Guidelines:**
- Use bullet points
- No need for checkboxes
- Brief descriptions
- No dates/priorities

### 4.6 Version History (REQUIRED)
**Purpose:** Track roadmap evolution

```markdown
## Version History
- **v1.1** (2025-01-27) - Backend API, Auth enhancements, Sitemap automation
- **v1.0** (2025-11-18) - Initial roadmap with foundation goals
```

**Guidelines:**
- List newest first
- Include date and major changes
- Keep descriptions brief

---

## 5. Best Practices

### 5.1 Keep It High-Level
- ❌ Don't list individual tasks or bug fixes
- ✅ Do group related work into meaningful milestones
- ❌ Don't include technical implementation details
- ✅ Do describe features and outcomes

### 5.2 Use Time Periods Appropriately
- **Quarters (Q1, Q2, etc.):** For annual planning
- **Sprints:** For agile teams (2-4 weeks)
- **Phases:** For waterfall or milestone-based projects
- **Months:** For short-term projects (3-6 months)

### 5.3 Update Regularly
- Mark items complete when finished (with dates)
- Review and update monthly or quarterly
- Create new version when quarter/phase ends
- Mark superseded versions as "Superseded by vX.Y"

### 5.4 Be Realistic
- Don't over-commit
- Include buffer time for unknowns
- Mark items "Pending" or "Backlog" if unsure
- Move items to backlog if priorities shift

### 5.5 Communicate Changes
- Update `CHANGELOG.md` when roadmap changes significantly
- Notify team when priorities shift
- Archive old versions (don't delete for history)

---

## 6. Example Structures

### 6.1 Small Project (3-6 months)

```markdown
# Project_Roadmap_v1.0

## Metadata
- **Created:** 2025-01-01
- **Last Updated:** 2025-01-01
- **Version:** 1.0
- **Description:** 6-month roadmap for MVP launch. Status: Active

## High-Level Goals
1. **MVP:** Launch core features by end of Q2.
2. **Beta:** Get 100 beta users.
3. **Feedback:** Iterate based on user feedback.

## Q1 2025 Priorities
- [ ] User authentication
- [ ] Core dashboard
- [ ] Landing page

## Q2 2025 Priorities
- [ ] Beta launch
- [ ] User feedback collection
- [ ] Bug fixes and polish

## Future Ideas (Backlog)
- Mobile app
- Advanced analytics
```

### 6.2 Medium Project (1 year)

```markdown
# Project_Roadmap_v1.0

## Metadata
- **Created:** 2025-01-01
- **Last Updated:** 2025-01-01
- **Version:** 1.0
- **Description:** Annual roadmap for product launch. Status: Active

## High-Level Goals
1. **Foundation:** Establish infrastructure (Q1-Q2).
2. **MVP:** Launch core product (Q3).
3. **Growth:** Scale to 1000 users (Q4).

## Q1 2025 Priorities
### Infrastructure
- [ ] Auth system
- [ ] Database schema
- [ ] CI/CD pipeline

### Core Features
- [ ] User dashboard
- [ ] API endpoints

## Q2 2025 Priorities
### MVP Features
- [ ] Landing page
- [ ] Subscription system
- [ ] Admin panel

### Testing
- [ ] Beta testing
- [ ] Security audit

## Q3-Q4 2025 Priorities
- [ ] Public launch
- [ ] Marketing campaigns
- [ ] User onboarding improvements

## Version History
- **v1.0** (2025-01-01) - Initial annual roadmap
```

### 6.3 Large Project (Multi-year)

```markdown
# Project_Roadmap_v2.0

## Metadata
- **Created:** 2025-01-01
- **Last Updated:** 2025-07-01
- **Version:** 2.0
- **Description:** 2-year strategic roadmap. Status: Active

## High-Level Goals
1. **Year 1:** Launch MVP and reach 10K users.
2. **Year 2:** Scale to 100K users and add enterprise features.
3. **Long-term:** Become industry leader in [domain].

## 2025 Priorities
### Phase 1: Foundation (Q1-Q2)
- [x] Infrastructure setup *(Completed: 2025-03-15)*
- [ ] MVP development

### Phase 2: Launch (Q3-Q4)
- [ ] Public launch
- [ ] User acquisition

## 2026 Priorities
### Phase 3: Scale (Q1-Q2)
- [ ] Enterprise features
- [ ] API v2

### Phase 4: Expansion (Q3-Q4)
- [ ] International launch
- [ ] Mobile apps

## Recent Milestones (v1.0 → v2.0)
### Completed in v2.0
1. **Infrastructure** - Complete cloud setup *(2025-03-15)*
2. **MVP Core** - User auth and dashboard *(2025-06-01)*

## Version History
- **v2.0** (2025-07-01) - Updated strategy, added 2026 priorities
- **v1.0** (2025-01-01) - Initial roadmap
```

---

## 7. When to Create New Versions

### 7.1 Create New Version When:
- Quarter or phase completes
- Major strategy pivot
- Significant scope change
- Annual planning cycle

### 7.2 Update Existing Version When:
- Marking items complete
- Updating dates/status
- Adding minor backlog items
- Small priority adjustments

### 7.3 Archive When:
- Roadmap is >1 year old and superseded
- Project completed or cancelled
- Complete strategy change

**Archiving Process:**
1. Move to `docs/archive/roadmap_v{X}_{Y}_archived.md`
2. Update status to "Archived"
3. Add note explaining why archived

---

## 8. Integration with Other Documents

### 8.1 CHANGELOG.md
- Update CHANGELOG when roadmap changes significantly
- Reference roadmap version in CHANGELOG entries
- See `standards/project-planning/documentation.md` Section 7 for changelog format

### 8.2 AGENTS.md
- Reference active roadmap in AGENTS.md if using AI agents
- Include in "Current Phase" section

### 8.3 README.md
- Link to active roadmap in README for visibility
- Include roadmap status in project description

---

## 9. Common Pitfalls to Avoid

### 9.1 Too Granular
❌ **Bad:** "Fix bug in login.ts line 45"
✅ **Good:** "Complete authentication system with OAuth support"

### 9.2 Unrealistic Timelines
❌ **Bad:** Committing to 50 features in Q1
✅ **Good:** 3-5 major milestones per quarter

### 9.3 Never Updating
❌ **Bad:** Creating roadmap and forgetting about it
✅ **Good:** Monthly reviews and updates

### 9.4 Too Vague
❌ **Bad:** "Improve performance"
✅ **Good:** "Reduce API response time to <200ms"

### 9.5 No Priorities
❌ **Bad:** Flat list of 30 items
✅ **Good:** Organized by priority (High/Medium/Low)

---

## 10. Related Documentation

- **Documentation Management:** `standards/project-planning/documentation.md`
- **Documentation Standards:** `standards/project-planning/documentation-standards.md`
- **Project Structure:** `standards/project-planning/project-structure.md`
- **Tech Stack Document:** `standards/project-planning/tech-stack-document.md`

---

## 11. Quick Reference Checklist

When creating a roadmap, ensure:

- [ ] Metadata section is complete
- [ ] Version number follows X.Y format
- [ ] High-Level Goals section exists (3-5 goals)
- [ ] Time-based priorities are organized by quarter/phase
- [ ] Completed items have completion dates
- [ ] Outstanding work is prioritized
- [ ] Version History is included
- [ ] File is named `roadmap_v{X}_{Y}.md`
- [ ] Located in `docs/roadmap/` or `docs/`
- [ ] Status is set (Active/Superseded/Archived)

---

*This standard defines how to create and maintain project roadmaps. For comprehensive documentation requirements, see `standards/project-planning/documentation-standards.md`.*

