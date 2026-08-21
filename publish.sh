#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# EnerTask — one-command publish to GitHub
# Usage:  ./publish.sh your-github-username
# ─────────────────────────────────────────────────────────────
set -e

USERNAME="${1:-}"
REPO="enertask"

if [ -z "$USERNAME" ] || [ "$USERNAME" = "YOUR_USERNAME" ]; then
  echo "Usage: ./publish.sh your-github-username"
  exit 1
fi

echo "🥕 Publishing EnerTask → github.com/$USERNAME/$REPO"
echo ""
echo "⚠️  First: create an EMPTY repo named '$REPO' at https://github.com/new"
echo "   (no README, no .gitignore, no license — this repo brings its own)"
read -p "Press Enter once the empty repo exists (or Ctrl+C to bail)..."

# 1. init if this isn't a git repo yet
if [ ! -d .git ]; then
  git init
fi

# 2. stage + commit everything
git add -A
git commit -m "🥕 EnerTask: capture ideas, manage tasks, own the clock — zero API, zero cost" \
  || echo "(nothing new to commit — already clean)"
git branch -M main

# 3. wire the remote (replace if it already points elsewhere)
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "https://github.com/$USERNAME/$REPO.git"
else
  git remote add origin "https://github.com/$USERNAME/$REPO.git"
fi

# 4. push (git will prompt for auth: browser SSO, PAT, or SSH)
git push -u origin main

echo ""
echo "✅ Pushed! Now finish in the browser:"
echo "   1. github.com/$USERNAME/$REPO → Settings → General → make it PUBLIC"
echo "   2. Settings → Pages → Source: 'GitHub Actions' (workflow deploys automatically)"
echo "   3. Live demo lands at https://$USERNAME.github.io/$REPO/ in ~1 minute"
echo ""
echo "🥕 Go show off those SE skills."
