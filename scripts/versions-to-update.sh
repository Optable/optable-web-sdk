#!/usr/bin/env bash
set -eu

usage() {
  cat << USAGE >&2
Usage:
  $0 <package> <version>
USAGE
}

if [[ $# -lt 2 ]]; then
  usage
  exit 1
fi

get_versions() {
  local package="$1"
  local version="$2"
  if [[ "$version" != v* ]]; then
    version="v$version"
  fi
  local major; major=$(semver get major "$version")
  local minor; minor=$(semver get minor "$version")
  local prerel; prerel=$(semver get prerel "$version")
  local prerel; latest_version=$(npm view "$package" version)

  # Prerelease we only update the current version
  if [[ "$prerel" != "" ]]; then
    echo "versions=['$version']"
    return 0
  fi

  local version_compare; version_compare=$(semver compare "$version" "$latest_version")

  # If this update version is the latest, we update all versions
  if [[ $version_compare -eq 1 ]]; then
    echo "versions=['$version','v$major.$minor','v$major','latest']"
    return 0
  fi

  # Initialize versions to update with the current version and major.minor, we always update both at least
  local versions_to_update=(
    "'$version'"
    "'v$major.$minor'"
  )

  # Get the latest minor version of the specified major version
  local latest_minor_of_specified_major; latest_minor_of_specified_major=$(npm view "$package" versions --json | jq -r '.[]' | grep -E "^$major\." | sort -V | tail -n 1)
  local latest_minor; latest_minor=$(semver get minor "$latest_minor_of_specified_major")

  # If the current version is the latest minor or greater version of the specified major version, we update the major version
  if [[ "$minor" -ge "$latest_minor" ]]; then
    versions_to_update+=("'v$major'")
  fi

  # format the output
  echo "versions=[$(IFS=, ; echo "${versions_to_update[*]}")]"
  return 0
}

get_versions "$1" "$2"
