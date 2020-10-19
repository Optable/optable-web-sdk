#!/usr/bin/env bash
set -e

usage() {
  cat << USAGE >&2
Usage:
  $0 <bucket-uri> <file> <version>
USAGE
}

if [[ $# -lt 3 ]]; then
  usage
  exit 1
fi

send_file() {
  local local_path;local_path="$1"
  local remote_path;remote_path="$2"
  echo "Sending $local_path to $remote_path"
  gsutil cp "$local_path" "$remote_path"
}

publish() {
  local bucket_uri
  # Usage of ${//} search/replace non-applicable as we *only* want to remove trailing slashes
  # shellcheck disable=SC2001
  bucket_uri="$(echo "$1" | sed 's#/*$##')"
  local file; file="$2"
  local version; version="$3"
  local expand_level; expand_level="$(expand_level "$3")"

  local filebase; filebase=$(basename "$file")
  local major; major=$(semver get major "$version")
  local minor; minor=$(semver get minor "$version")

  # Send fully qualified version
  send_file "$file" "$bucket_uri/$version/$filebase"

  # Expand minor
  [[ $expand_level -gt 0 ]] && send_file "$file" "$bucket_uri/v$major.$minor/$filebase"

  # Expand major
  [[ $expand_level -gt 1 ]] && send_file "$file" "$bucket_uri/v$major/$filebase"

  # Expand latest
  [[ $expand_level -gt 2 ]] && send_file "$file" "$bucket_uri/latest/$filebase"
  return 0
}

# expand-level:
# PATCH  : 0 -> noop
# MINOR  : 1 -> vX.Y
# MAJOR  : 2 -> vX.Y vX
# LATEST : 3 -> vX.Y vX latest

expand_level() {
  local version; version="$1"
  local prerel; prerel=$(semver get prerel "$version")

  # Never expand for prereleases
  if [[ "$prerel" != ""  ]]; then
    echo 0
    return
  fi

  local sorted_versions; sorted_versions=$(git tag -l --sort="-v:refname")
  local last_version; last_version=$(echo "$sorted_versions" | head -1)

  local major; major=$(semver get major "$version")
  local minor; minor=$(semver get minor "$version")

  # If current version is equal or greater latest version, expand all
  if [[ "$(semver compare "$last_version" "$version")" -lt 1 ]]; then
    echo 3
    return
  fi

  local last_minor_version; last_minor_version=$(echo "$sorted_versions" | grep -E "v$major" | head -1)
  # If current version is equal or greater latest minor version, expand major and minor
  if [[ "$(semver compare "$last_minor_version" "$version")" -lt 1 ]]; then
    echo 2
    return
  fi

  local last_patch_version; last_patch_version=$(echo "$sorted_versions" | grep -E "v$major.$minor" | head -1)

  # If current version is equal or greater latest patch version, expand minor
  if [[ "$(semver compare "$last_patch_version" "$version")" -lt 1 ]]; then
    echo 1
    return
  fi
  # Else don't expand
  echo 0
}

publish "$1" "$2" "$3"
