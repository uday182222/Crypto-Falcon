#!/bin/bash

# Deployment Verification Script for MotionFalcon Frontend
# This script helps verify that routing is working correctly in deployed environments

echo "🔍 MotionFalcon Frontend Deployment Verification"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the crypto-frontend directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo "📦 Package.json found: ✅"

# Check for required files
echo ""
echo "📋 Checking required files:"
required_files=("public/_redirects" "public/_headers" "public/404.html" "src/App.jsx")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (MISSING!)"
    fi
done

# Check build output
echo ""
echo "🏗️  Checking build output:"
if [ -d "dist" ]; then
    echo "  ✅ dist/ directory exists"
    
    # Check for routing files in dist
    dist_files=("dist/_redirects" "dist/_headers" "dist/404.html" "dist/index.html")
    for file in "${dist_files[@]}"; do
        if [ -f "$file" ]; then
            echo "  ✅ $file"
        else
            echo "  ❌ $file (MISSING from build!)"
        fi
    done
    
    # Check for JS bundles
    js_files=$(find dist -name "*.js" | head -5)
    if [ -n "$js_files" ]; then
        echo "  ✅ JavaScript bundles found"
        echo "     $(echo "$js_files" | wc -l) JS files in dist/"
    else
        echo "  ❌ No JavaScript bundles found in dist/"
    fi
else
    echo "  ❌ dist/ directory not found - run 'npm run build' first"
fi

# Check package.json scripts
echo ""
echo "📜 Checking package.json scripts:"
if grep -q "postbuild" package.json; then
    echo "  ✅ postbuild script found"
else
    echo "  ❌ postbuild script missing"
fi

# Check for common deployment issues
echo ""
echo "🚨 Common Deployment Issues Check:"
echo "  • Browser caching: Check _headers file for no-cache directives"
echo "  • Route handling: Check _redirects file for SPA routing"
echo "  • 404 handling: Check 404.html for proper fallback"
echo "  • Build output: Ensure all files are copied to dist/"

# Provide deployment commands
echo ""
echo "🚀 Deployment Commands:"
echo "  1. Build: npm run build"
echo "  2. Verify: npm run postbuild"
echo "  3. Deploy: Copy dist/ contents to your hosting provider"
echo "  4. Test: Visit your deployed URL and test navigation"

# Check if build is needed
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo ""
    echo "⚠️  Build needed! Run: npm run build"
fi

echo ""
echo "✅ Verification complete!"
echo "💡 If you're still having routing issues, check:"
echo "   • Browser developer console for errors"
echo "   • Network tab for failed requests"
echo "   • Application tab for cached resources"
echo "   • Your hosting provider's routing configuration"
