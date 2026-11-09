#!/usr/bin/env bash
# Legt Protokoll-Dateien im Branch ci-logs ab (die Logs der Actions sind von außen nicht immer abrufbar).
# Eigener Arbeitsbaum: der Stand in ./site bleibt unberührt. Aufruf: bash tools/ci-log.sh datei1 [datei2 ...]
set -u
wt="$(mktemp -d)/wt"
git config user.name "github-actions[bot]"
git config user.email "41898283+github-actions[bot]@users.noreply.github.com"
if git fetch -q origin ci-logs 2>/dev/null; then
  git worktree add -q --detach "$wt" FETCH_HEAD
else
  git worktree add -q --detach "$wt" HEAD
  (cd "$wt" && git checkout -q --orphan neu && git rm -rfq . )
fi
for f in "$@"; do [ -f "$f" ] && cp "$f" "$wt/"; done
cd "$wt"
git add -A
git commit -q -m "Protokoll $(date -u +%FT%TZ) ${GITHUB_WORKFLOW:-}" || true
for i in 1 2 3; do
  git push -q origin HEAD:refs/heads/ci-logs && break
  git fetch -q origin ci-logs && git rebase -q FETCH_HEAD || true
done
cd - >/dev/null
git worktree remove --force "$wt" || true
