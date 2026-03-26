#!/bin/bash
# Ensure symphony-state dist files are available for the demo app.
# Handles two scenarios:
#   1. Local dev: npm creates a symlink via file:.. — replace it with a real copy (Turbopack can't follow external symlinks)
#   2. CI / Vercel: dist/ doesn't exist because it's gitignored — build the library first, then copy
set -e

LIB_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PKG_DIR="node_modules/@shiftbloom-studio/symphony-state"

# Step 1: Build the library if dist/ doesn't exist (CI / fresh clone)
if [ ! -d "$LIB_ROOT/dist" ]; then
  echo "⏳ Building symphony-state library (dist/ not found)..."
  (cd "$LIB_ROOT" && npm install --ignore-scripts && npm run build)
  echo "✓ Library built"
fi

# Step 2: Replace symlink with real copy for Turbopack
if [ -L "$PKG_DIR" ]; then
  REAL_PATH=$(cd "$PKG_DIR" && pwd -P)
  rm "$PKG_DIR"
  mkdir -p "$PKG_DIR"
  cp -r "$REAL_PATH/dist" "$PKG_DIR/dist"
  cp "$REAL_PATH/package.json" "$PKG_DIR/package.json"
  echo "✓ Replaced symlink with real copy"
elif [ ! -d "$PKG_DIR/dist" ]; then
  # No symlink and no dist — direct copy (CI where npm didn't create a symlink)
  mkdir -p "$PKG_DIR"
  cp -r "$LIB_ROOT/dist" "$PKG_DIR/dist"
  cp "$LIB_ROOT/package.json" "$PKG_DIR/package.json"
  echo "✓ Copied dist files directly"
else
  echo "✓ Already set up"
fi
