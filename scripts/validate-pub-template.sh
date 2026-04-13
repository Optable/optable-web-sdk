#!/usr/bin/env bash
# Validates that browser/pub.ts renders to compilable TypeScript.
#
# This script simulates Go text/template rendering by replacing template
# directives with sample values, then compiles the result with esbuild
# to catch syntax errors before they reach a release.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATE="${REPO_ROOT}/browser/pub.ts"
WORKDIR="$(mktemp -d)"

trap 'rm -rf "${WORKDIR}"' EXIT

echo "Validating pub.ts template..."

# Render template with sample config values.
# Features that depend on SDK methods not yet implemented are disabled.
rendered="${WORKDIR}/pub.ts"

sed \
  -e '/{{if/d' \
  -e '/{{end}}/d' \
  -e 's/{{- if [^}]*}}//' \
  -e 's/{{- end}}//' \
  -e 's/{{\.Host}}/sample.edge.example.co/g' \
  -e 's/{{\.Site}}/sample-site/g' \
  -e 's/{{\.Node}}/sample-node/g' \
  -e 's/{{\.PrebidGlobal}}/pbjs/g' \
  -e 's/{{\.Timeout}}/500ms/g' \
  "${TEMPLATE}" > "${rendered}"

echo "Rendered template to ${rendered}"

# Compile with esbuild to verify the output is valid TypeScript.
# @optable/web-sdk is marked external since it's resolved at bundle time (Phase 5).
npx --yes esbuild "${rendered}" \
  --bundle \
  --format=iife \
  --platform=browser \
  --target=es2015 \
  --external:@optable/web-sdk \
  --external:@optable/web-sdk/* \
  --outfile="${WORKDIR}/pub.js"

echo "Template validation passed: pub.ts renders to compilable TypeScript."
