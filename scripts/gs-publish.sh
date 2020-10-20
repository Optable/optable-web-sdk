#!/usr/bin/env bash
set -eu

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
  local local_path="$1"
  local remote_path="$2"
  echo "Sending $local_path to $remote_path"
  gsutil -h "x-goog-meta-optable-sdk-version:$version" cp "$local_path" "$remote_path"
}

get_version() {
  local remote_path="$1"
  gsutil ls -L "$remote_path" 2>/dev/null | grep optable-sdk-version | cut -d ':' -f2
}

publish() {
  local bucket_uri=${1%/}
  local file="$2"
  local version="$3"
  local filebase; filebase=$(basename "$file")
  local major; major=$(semver get major "$version")
  local minor; minor=$(semver get minor "$version")
  local prerel; prerel=$(semver get prerel "$version")

  # Send fully qualified version
  send_file "$file" "$bucket_uri/$version/$filebase" "$version"

  if [[ "$prerel" != "" ]]; then
    return 0
  fi

  # Evaluate each potential expansions
  local expansions=(
    "$bucket_uri/v$major.$minor/$filebase"
    "$bucket_uri/v$major/$filebase"
    "$bucket_uri/latest/$filebase"
  )

  local path_version
  for path in "${expansions[@]}"; do
    path_version=$(get_version "$path")
    if [[ "$path_version" == "" || "$(semver compare "$path_version" "$version")" -lt 1 ]]; then
      send_file "$file" "$path"
    fi
  done

  return 0
}

publish "$1" "$2" "$3"
