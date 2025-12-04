# Project Template with Nested Cursor Rules

This is a complete project template that demonstrates how to use **nested Cursor rules** to create domain-specific "roles" for your AI agent. The agent automatically adapts its behavior based on which directory you're working in.

---

## 🎯 What is This?

This template provides a structured project layout with **Cursor rules** strategically placed to guide AI agent behavior:

- **Root-level rules** (`.cursor/rules/`) define global behavior
- **Nested rules** in subdirectories create domain-specific "roles"
- **Agent automatically switches context** based on file location

---

## 🏗️ Structure

```
project-template/
├── .cursor/rules/              # Root-level rules (apply everywhere)
│   ├── ai-interaction-rules.mdc  # General coding behavior
│   ├── environment.mdc           # Environment setup standards
│   └── task-workflow.mdc         # Development workflow
├── src/
│   ├── frontend/
│   │   ├── .cursor/rules/
│   │   │   └── frontend-standards.mdc  # 🎨 Frontend "role"
│   │   ├── components/
│   │   └── hooks/
│   ├── backend/
│   │   ├── .cursor/rules/
│   │   │   └── backend-standards.mdc   # ⚙️ Backend "role"
│   │   ├── api/
│   │   └── services/
│   └── lib/                     # Shared utilities
├── database/
│   ├── .cursor/rules/
│   │   └── database-standards.mdc       # 🗄️ Database "role"
│   ├── migrations/
│   └── schema/
├── tests/
│   ├── .cursor/rules/
│   │   └── testing-standards.mdc        # 🧪 Testing "role"
│   ├── unit/
│   └── integration/
├── docs/
│   ├── .cursor/rules/
│   │   └── documentation-standards.mdc  # 📝 Documentation "role"
│   └── TECH_STACK.md
├── .env.example
├── AGENTS.md                    # Project context for AI agent
└── README.md                    # This file
```

---

## 🚀 How to Use

### 1. Copy This Template

```bash
cp -r templates/project-template/ /path/to/your/new-project/
cd /path/to/your/new-project/
```

### 2. Customize the Rules

Each rule file has a **"Customization Notes"** section. Adapt them for your project:

1. **Root Rules** (`.cursor/rules/`):
   - `ai-interaction-rules.mdc` - Add project-specific conventions
   - `environment.mdc` - Specify your tech stack versions
   - `task-workflow.mdc` - Define your git/PR workflow

2. **Nested Rules** (in subdirectories):
   - Keep them concise (50-150 lines)
   - Focus on domain-specific directives
   - Reference comprehensive standards for details

### 3. Add Your Standards

Create `standards/` directory with comprehensive documentation:
- `standards/frontend/` - Complete frontend patterns
- `standards/backend/` - Complete backend patterns
- `standards/database/` - Complete database patterns
- etc.

Nested rules **reference** these standards, keeping rules concise.

### 4. Create AGENTS.md

Create an `AGENTS.md` file at the root with:
- Project mission and goals
- Current phase and active tasks
- Architecture highlights
- Persistent memory/learnings
- Developer lifecycle

See the main repository's `AGENTS.md` for a template.

---

## 💡 How Nested Rules Work

### Single Agent, Multiple "Roles"

When you're working in different directories, the AI agent automatically adopts different behaviors:

| Working In | Active Rules | Agent Behavior |
|------------|-------------|----------------|
| `src/frontend/` | Root + Frontend | Acts as **Frontend Specialist** - knows React patterns, component structure, styling |
| `src/backend/` | Root + Backend | Acts as **Backend Specialist** - knows API patterns, error handling, services |
| `database/` | Root + Database | Acts as **Database Manager** - knows schema design, migrations, RLS |
| `tests/` | Root + Testing | Acts as **QA Engineer** - knows test patterns, coverage, mocking |
| `docs/` | Root + Documentation | Acts as **Technical Writer** - knows docs structure, style, formatting |

### Benefits

✅ **Automatic Context Switching** - Agent behavior adapts based on file location  
✅ **Focused Guidance** - Agent sees only relevant rules for current work  
✅ **Reduced Cognitive Load** - Rules stay concise and actionable  
✅ **Consistent Patterns** - Same agent enforces different patterns per domain  
✅ **Scalable** - Add new domains by creating new nested rules  

---

## 📏 Rule Length Guidelines

- **Root-level rules:** 100-300 lines (optimal: 150-200)
- **Nested "role" rules:** 50-150 lines (keep concise!)
- **Absolute maximum:** 500 lines (per Cursor documentation)

### Keep Nested Rules Concise

Nested rules should contain:
1. **Core requirements** - What to do
2. **Common patterns** - How to do it
3. **Examples** - Good vs bad
4. **Reference to full standard** - "See `standards/[domain]/` for complete details"

Don't duplicate everything from standards - just provide actionable directives.

---

## 🎨 Example: Frontend Rule in Action

When working in `src/frontend/components/UserCard.tsx`:

**Active Rules:**
- `.cursor/rules/ai-interaction-rules.mdc` (root)
- `.cursor/rules/environment.mdc` (root)
- `.cursor/rules/task-workflow.mdc` (root)
- `src/frontend/.cursor/rules/frontend-standards.mdc` ✨ (nested)

**Agent Behavior:**
- Knows to use TypeScript
- Knows to create props interface
- Knows to use named exports
- Knows to use Tailwind CSS
- References `standards/frontend/` for details

---

## 🔧 Customization Checklist

When adapting this template:

### Root Rules
- [ ] Update `ai-interaction-rules.mdc` with project conventions
- [ ] Update `environment.mdc` with tech stack versions
- [ ] Update `task-workflow.mdc` with git/PR workflow

### Nested Rules
- [ ] Adapt `frontend-standards.mdc` for your frontend stack
- [ ] Adapt `backend-standards.mdc` for your backend patterns
- [ ] Adapt `database-standards.mdc` for your database (if applicable)
- [ ] Adapt `testing-standards.mdc` for your test framework
- [ ] Adapt `documentation-standards.mdc` for your docs format

### Project Setup
- [ ] Create `AGENTS.md` with project context
- [ ] Create `standards/` with comprehensive documentation
- [ ] Update `.env.example` with required environment variables
- [ ] Add project-specific directories (if needed)

---

## 📚 Additional Resources

- **Cursor Rules Standards:** `../../standards/process/cursor-rules-standards.md`
- **Rule Creation Guide:** `../../.cursor/rules/cursor-rule-creation.mdc`
- **Full Standards Library:** `../../standards/`
- **Module Library:** `../../modules/`

---

## 🤝 Contributing

When you discover useful patterns or improvements:
1. Update the relevant nested rule
2. Document in your project's `standards/`
3. Consider contributing back to the main standards library

---

## 📖 Related Documentation

- [Standards Integration Guide](../../STANDARDS_INTEGRATION_GUIDE.md) - How to integrate standards library
- [Cursor Rules Standards](../../standards/process/cursor-rules-standards.md) - Complete rule creation guide
- [Module Structure](../../standards/module-structure.md) - How to create reusable modules

---

**Happy coding with your AI agent team! 🚀**

