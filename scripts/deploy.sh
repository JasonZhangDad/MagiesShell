#!/usr/bin/env bash
# Deploy MagiesTerminal marketing site to shell.magies.top origin (129).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

HOST="${DEPLOY_HOST:-zhoumi}"
REMOTE="${DEPLOY_PATH:-/var/www/shell.magies.top}"

if [[ "${1:-}" == "--sync-changelog" ]]; then
  npm run sync:changelog
fi

npm run build

rsync -avz --delete \
  --exclude 'stats' \
  --exclude 'stats/' \
  dist/ "${HOST}:${REMOTE}/"

echo "Deployed dist/ → ${HOST}:${REMOTE}/"
echo "Tip: hard-refresh the site; rename images when content changes (CDN)."
