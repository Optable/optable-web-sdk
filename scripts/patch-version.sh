#!/usr/bin/env bash
set -e

usage() {
  exitcode="$1"
  cat << USAGE >&2
Usage:
  $0 <version>
USAGE
  exit "$exitcode"
}

if [ "$1" = "--help" ] || [ "$1" == "" ]; then
  usage 0
fi

write_version() {
  sed -i"" "s/0.0.0-REPLACE/$1/" ./package.json ./lib/build.json
}

write_version "$1"
