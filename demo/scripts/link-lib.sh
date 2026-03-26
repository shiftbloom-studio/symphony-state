#!/bin/bash
# Replace the npm symlink with a real copy so Turbopack can resolve it.
# This is needed because Turbopack refuses to follow symlinks outside the project root.
set -e

PKG_DIR="node_modules/@shiftbloom-studio/symphony-state"

# Only replace if it's a symlink (npm creates symlinks for file: deps)
if [ -L "$PKG_DIR" ]; then
  # Resolve the symlink to an absolute path
  REAL_PATH=$(cd "$PKG_DIR" && pwd -P)
  rm "$PKG_DIR"
  mkdir -p "$PKG_DIR"
  cp -r "$REAL_PATH/dist" "$PKG_DIR/dist"
  cp "$REAL_PATH/package.json" "$PKG_DIR/package.json"
  echo "✓ Replaced symlink with real copy for Turbopack compatibility"
else
  echo "✓ Not a symlink, nothing to do"
fi
