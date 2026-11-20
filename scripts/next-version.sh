#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat << USAGE >&2
Usage:
  $0 <ref> [auto|patch|minor|major]
USAGE
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

ref="$1"
override="${2:-auto}"
case "$override" in
  auto | patch | minor | major) ;;
  *)
    usage
    exit 1
    ;;
esac

# Ascending, so a level's index is its rank.
levels=(patch minor major)
# The rank each label gives its PR. Any other label, and a commit without a PR, ranks as patch.
label_ranks='{"breaking": 2, "type:feature": 1}'
# shellcheck disable=SC2016
pr_summary='
  .[0] // empty
  | [.labels[].name] as $names
  | [
      .number,
      ([$names[] | $ranks[.] // 0] | max // 0),
      (any($names[]; startswith("type:") or . == "dependencies") | tostring),
      .title
    ]
  | @tsv'

tags=$(git tag --sort=v:refname)
previous=$(grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' <<< "$tags" | tail -n 1)
echo "previous=$previous"

commits=$(git rev-list --reverse "$previous..$ref")
if [[ -z "$commits" ]]; then
  echo "version="
  exit 0
fi

rank=0
sources=""
unlabeled=""
for sha in $commits; do
  pr=$(gh api "repos/{owner}/{repo}/commits/$sha/pulls" | jq -r --argjson ranks "$label_ranks" "$pr_summary")
  if [[ -z "$pr" ]]; then
    echo "${sha:0:7} patch (no PR)" >&2
    continue
  fi

  IFS=$'\t' read -r number pr_rank typed title <<< "$pr"
  echo "#$number ${levels[pr_rank]} $title" >&2
  if [[ "$typed" == false ]]; then
    unlabeled+="${unlabeled:+ }#$number"
  fi
  if ((pr_rank > rank)); then
    rank=$pr_rank
    sources=""
  fi
  if ((pr_rank == rank && rank > 0)); then
    sources+="${sources:+ }#$number"
  fi
done

computed=${levels[rank]}
if [[ "$override" == auto ]]; then
  bump=$computed
  reason="$bump${sources:+ from $sources}"
else
  bump=$override
  reason="$bump (set by hand, labels gave $computed)"
fi

version="v$(semver bump "$bump" "$previous")"
echo "version=$version"
echo "bump=$bump"
echo "reason=$reason"
echo "unlabeled=$unlabeled"
