#!/bin/bash
#
# Rename supabase-core module to supabase-core-typescript
#
# This script renames the module directory and updates all references
# in the codebase to use the new name.
#
# Usage:
#   ./scripts/rename-supabase-core-to-typescript.sh
#
# Note: This script should be run from the project root directory.

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

OLD_NAME="supabase-core"
NEW_NAME="supabase-core-typescript"
OLD_DIR="$PROJECT_ROOT/modules/$OLD_NAME"
NEW_DIR="$PROJECT_ROOT/modules/$NEW_NAME"

echo "🔄 Renaming $OLD_NAME to $NEW_NAME..."
echo ""

# Check if old directory exists
if [ ! -d "$OLD_DIR" ]; then
    echo "❌ Error: Directory $OLD_DIR does not exist"
    exit 1
fi

# Check if new directory already exists
if [ -d "$NEW_DIR" ]; then
    echo "❌ Error: Directory $NEW_DIR already exists"
    exit 1
fi

# Step 1: Rename the directory
echo "📁 Step 1: Renaming directory..."
mv "$OLD_DIR" "$NEW_DIR"
echo "   ✅ Directory renamed: $OLD_DIR -> $NEW_DIR"

# Step 2: Update package.json
echo ""
echo "📦 Step 2: Updating package.json..."
if [ -f "$NEW_DIR/package.json" ]; then
    # Update package name
    sed -i.bak 's/"name": "@standards\/supabase-core"/"name": "@standards\/supabase-core-typescript"/' "$NEW_DIR/package.json"
    rm "$NEW_DIR/package.json.bak"
    echo "   ✅ Updated package.json name"
fi

# Step 3: Update README.md
echo ""
echo "📝 Step 3: Updating README.md..."
if [ -f "$NEW_DIR/README.md" ]; then
    sed -i.bak "s/- \*\*Module:\*\* supabase-core/- **Module:** supabase-core-typescript/g" "$NEW_DIR/README.md"
    sed -i.bak "s|cp -r modules/supabase-core|cp -r modules/supabase-core-typescript|g" "$NEW_DIR/README.md"
    sed -i.bak "s|from '@/lib/supabase-core'|from '@/lib/supabase-core-typescript'|g" "$NEW_DIR/README.md"
    sed -i.bak "s|modules/supabase-core/types|modules/supabase-core-typescript/types|g" "$NEW_DIR/README.md"
    rm "$NEW_DIR/README.md.bak"
    echo "   ✅ Updated README.md"
fi

# Step 4: Update index.ts module comment
echo ""
echo "📝 Step 4: Updating index.ts..."
if [ -f "$NEW_DIR/index.ts" ]; then
    sed -i.bak "s/@module supabase-core/@module supabase-core-typescript/" "$NEW_DIR/index.ts"
    rm "$NEW_DIR/index.ts.bak"
    echo "   ✅ Updated index.ts"
fi

# Step 5: Update COMPLETENESS_CHECK.md
echo ""
echo "📝 Step 5: Updating COMPLETENESS_CHECK.md..."
if [ -f "$NEW_DIR/COMPLETENESS_CHECK.md" ]; then
    sed -i.bak "s|modules/supabase-core/types|modules/supabase-core-typescript/types|g" "$NEW_DIR/COMPLETENESS_CHECK.md"
    rm "$NEW_DIR/COMPLETENESS_CHECK.md.bak"
    echo "   ✅ Updated COMPLETENESS_CHECK.md"
fi

# Step 6: Update all references in other files
echo ""
echo "🔍 Step 6: Searching for references in other files..."

# Files that might reference supabase-core
FILES_TO_UPDATE=(
    "CHANGELOG.md"
    "modules/backend-api/README.md"
    "modules/backend-api/package.json"
    "modules/backend-api/src/middleware/auth.ts"
    "modules/auth-profile-sync/README.md"
    "modules/supabase-core-python/README.md"
    "modules/supabase-core-python/COMPLETENESS_CHECK.md"
    "modules/supabase-core-python/INTEGRATION_GUIDE.md"
    "standards/architecture/supabase-ai-agent-guide.md"
    "standards/architecture/supabase-module-enhancement-plan.md"
    "standards/architecture/supabase-multi-tenant-auth.md"
    "standards/architecture/supabase-database-functions.md"
    "standards/architecture/supabase-feature-coverage-summary.md"
    "standards/documentation.md"
    "standards/testing.md"
    "docs/process/DOCUMENTATION_STRUCTURE.md"
)

for file in "${FILES_TO_UPDATE[@]}"; do
    filepath="$PROJECT_ROOT/$file"
    if [ -f "$filepath" ]; then
        # Update references (be careful with sed patterns)
        sed -i.bak "s|modules/supabase-core|modules/supabase-core-typescript|g" "$filepath"
        sed -i.bak "s|@standards/supabase-core|@standards/supabase-core-typescript|g" "$filepath"
        sed -i.bak "s|supabase-core/|supabase-core-typescript/|g" "$filepath"
        sed -i.bak "s|'supabase-core'|'supabase-core-typescript'|g" "$filepath"
        sed -i.bak "s|\"supabase-core\"|\"supabase-core-typescript\"|g" "$filepath"
        sed -i.bak "s|supabase-core module|supabase-core-typescript module|g" "$filepath"
        sed -i.bak "s|supabase-core TypeScript|supabase-core-typescript|g" "$filepath"
        rm "$filepath.bak" 2>/dev/null || true
        echo "   ✅ Updated $file"
    fi
done

# Step 7: Update imports in backend-api module
echo ""
echo "📝 Step 7: Updating imports in backend-api module..."
if [ -f "$PROJECT_ROOT/modules/backend-api/src/middleware/auth.ts" ]; then
    sed -i.bak "s|@modules/supabase-core|@modules/supabase-core-typescript|g" "$PROJECT_ROOT/modules/backend-api/src/middleware/auth.ts"
    sed -i.bak "s|supabase-core's|supabase-core-typescript's|g" "$PROJECT_ROOT/modules/backend-api/src/middleware/auth.ts"
    rm "$PROJECT_ROOT/modules/backend-api/src/middleware/auth.ts.bak" 2>/dev/null || true
    echo "   ✅ Updated backend-api auth.ts"
fi

if [ -f "$PROJECT_ROOT/modules/backend-api/package.json" ]; then
    sed -i.bak "s|\"@modules/supabase-core\"|\"@modules/supabase-core-typescript\"|g" "$PROJECT_ROOT/modules/backend-api/package.json"
    rm "$PROJECT_ROOT/modules/backend-api/package.json.bak" 2>/dev/null || true
    echo "   ✅ Updated backend-api package.json"
fi

# Step 8: Update Python module references
echo ""
echo "📝 Step 8: Updating Python module references..."
PYTHON_FILES=(
    "modules/supabase-core-python/README.md"
    "modules/supabase-core-python/COMPLETENESS_CHECK.md"
    "modules/supabase-core-python/INTEGRATION_GUIDE.md"
)

for file in "${PYTHON_FILES[@]}"; do
    filepath="$PROJECT_ROOT/$file"
    if [ -f "$filepath" ]; then
        sed -i.bak "s|- \`modules/supabase-core/\`|- \`modules/supabase-core-typescript/\`|g" "$filepath"
        sed -i.bak "s|modules/supabase-core/|modules/supabase-core-typescript/|g" "$filepath"
        rm "$filepath.bak" 2>/dev/null || true
        echo "   ✅ Updated $file"
    fi
done

echo ""
echo "✅ Renaming complete!"
echo ""
echo "📋 Summary:"
echo "   - Directory renamed: $OLD_NAME -> $NEW_NAME"
echo "   - Package name updated"
echo "   - Documentation updated"
echo "   - References in other files updated"
echo ""
echo "⚠️  Next steps:"
echo "   1. Review the changes with: git diff"
echo "   2. Test imports in your project"
echo "   3. Update any CI/CD configurations"
echo "   4. Commit the changes"
echo ""

