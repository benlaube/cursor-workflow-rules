# Renaming Guide: supabase-core → supabase-core-typescript

This guide explains the renaming of the `supabase-core` module to `supabase-core-typescript` for better clarity and consistency.

## Why Rename?

The original `supabase-core` name was ambiguous because:
- It didn't indicate the language (TypeScript vs Python)
- The Python version (`supabase-core-python`) made the naming inconsistent
- Developers might confuse which module to use

## New Naming Convention

```
modules/
├── supabase-core-typescript/  (TypeScript/Next.js)
└── supabase-core-python/      (Python/Django/FastAPI/Flask)
```

## Automated Renaming Script

A script has been created to automate the renaming process:

```bash
./scripts/rename-supabase-core-to-typescript.sh
```

### What the Script Does

1. **Renames the directory:**
   - `modules/supabase-core/` → `modules/supabase-core-typescript/`

2. **Updates package.json:**
   - Changes package name from `@standards/supabase-core` to `@standards/supabase-core-typescript`

3. **Updates documentation:**
   - README.md references
   - COMPLETENESS_CHECK.md paths
   - Module comments in index.ts

4. **Updates references in other modules:**
   - `modules/backend-api/` - imports and package.json
   - `modules/auth-profile-sync/` - README references
   - `modules/supabase-core-python/` - comparison docs

5. **Updates standards and documentation:**
   - Architecture guides
   - Documentation standards
   - CHANGELOG.md

## Manual Steps After Running Script

After running the script, you should:

1. **Review changes:**
   ```bash
   git diff
   ```

2. **Test imports:**
   - Update your project's import paths
   - Test that everything still works

3. **Update CI/CD:**
   - Update any build scripts
   - Update deployment configurations

4. **Update documentation:**
   - Review all documentation for accuracy
   - Update any external references

## Files Updated by Script

The script updates references in:

- Module files (package.json, README.md, index.ts)
- Dependent modules (backend-api, auth-profile-sync)
- Documentation (standards/, docs/)
- Python module comparison docs

## Breaking Changes

⚠️ **This is a breaking change** for any code that imports from `@modules/supabase-core`:

**Before:**
```typescript
import { createClient } from '@modules/supabase-core'
```

**After:**
```typescript
import { createClient } from '@modules/supabase-core-typescript'
```

## Rollback

If you need to rollback:

```bash
# Rename directory back
mv modules/supabase-core-typescript modules/supabase-core

# Restore from git
git checkout modules/supabase-core/
git checkout modules/backend-api/
git checkout modules/auth-profile-sync/
# ... restore other files
```

## Verification Checklist

After renaming, verify:

- [ ] Directory renamed correctly
- [ ] Package.json updated
- [ ] All imports updated
- [ ] Documentation updated
- [ ] Tests still pass
- [ ] Build succeeds
- [ ] No broken references

---

*Last Updated: 2025-01-27*

