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
  local major=$(semver get major "$version")
  local minor=$(semver get minor "$version")
  local prerel=$(semver get prerel "$version")
  local latestVersion=$(npm view $package version)

  # Prerelease we only update the current version
  if [[ "$prerel" != "" ]]; then
    echo "versions=['$version']"
    return 0
  fi

  local versionCompare=$(semver compare "$version" "$latestVersion")

  # If this update version is the latest, we update all versions
  if [[ $versionCompare -eq 1 ]]; then
    echo "versions=['$version','v$major.$minor','v$major','latest']"
    return 0
  fi

  # Initialize versions to update with the current version and major.minor, we always update both at least
  local versionsToUpdate=(
    "$version"
    "v$major.$minor"
  )

  # Get the latest minor version of the specified major version
  local latestMinorOfSpecifiedMajor=$(npm view $package versions --json | jq -r '.[]' | grep -E "^$major\." | sort -V | tail -n 1)
  local latestMinor=$(semver get minor "$latestMinorOfSpecifiedMajor")

  # If the current version is the latest minor or greater version of the specified major version, we update the major version
  if [[ "$minor" -ge "$latestMinor" ]]; then
    versionsToUpdate+=("v$major")
  fi

  # format the output
  echo "versions=['$(IFS=, ; echo "${versionsToUpdate[*]}" | sed "s/,/','/g")']"
  return 0
}

get_versions "$1" "$2"
