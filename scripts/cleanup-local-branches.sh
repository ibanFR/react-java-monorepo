#!/usr/bin/env zsh
# cleanup-local-branches.sh
# Deletes local branches whose remote tracking branch no longer exists.
# Usage: ./scripts/cleanup-local-branches.sh [-f] [-n]
#   -f  Force delete (git branch -D) instead of safe delete (git branch -d)
#   -n  Dry run — only list branches that would be deleted

set -euo pipefail

force=false
dry_run=false

while getopts "fn" opt; do
  case $opt in
    f) force=true ;;
    n) dry_run=true ;;
    *) echo "Usage: $0 [-f] [-n]" >&2; exit 1 ;;
  esac
done

# Fetch and prune remote tracking refs so stale ones are removed
echo "Fetching and pruning remote references..."
git fetch --prune

current_branch=$(git symbolic-ref --short HEAD 2>/dev/null || true)

branches_to_delete=()

while IFS= read -r branch; do
  # Skip empty lines
  [[ -z "$branch" ]] && continue

  # Never delete the current branch
  if [[ "$branch" == "$current_branch" ]]; then
    continue
  fi

  # Get the configured upstream ref name (e.g. "origin/feature-x")
  tracking_ref=$(git for-each-ref --format='%(upstream:short)' "refs/heads/$branch")

  if [[ -z "$tracking_ref" ]]; then
    # No upstream configured at all
    branches_to_delete+=("$branch")
  elif ! git show-ref --verify --quiet "refs/remotes/$tracking_ref" 2>/dev/null; then
    # Upstream is configured but the remote tracking ref no longer exists (gone)
    branches_to_delete+=("$branch")
  fi
done < <(git for-each-ref --format='%(refname:short)' refs/heads/)

if [[ ${#branches_to_delete[@]} -eq 0 ]]; then
  echo "No local branches to clean up. All branches have a remote tracking branch."
  exit 0
fi

echo ""
echo "Local branches without a remote tracking branch:"
for b in "${branches_to_delete[@]}"; do
  echo "  - $b"
done
echo ""

if $dry_run; then
  echo "(Dry run — no branches were deleted)"
  exit 0
fi

delete_flag="-d"
if $force; then
  delete_flag="-D"
fi

for b in "${branches_to_delete[@]}"; do
  echo "Deleting branch: $b"
  git branch "$delete_flag" "$b"
done

echo ""
echo "Done. Deleted ${#branches_to_delete[@]} branch(es)."

