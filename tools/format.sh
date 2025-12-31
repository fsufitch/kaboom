#!/usr/bin/env bash
set -euo pipefail

WS="${BUILD_WORKSPACE_DIRECTORY:-}"
if [[ -z "${WS}" ]]; then
  echo "ERROR: BUILD_WORKSPACE_DIRECTORY is not set. Run via: bazel run //:format" >&2
  exit 1
fi

cd "${WS}"

# Adjust globs as desired. Using git ls-files keeps it fast and avoids bazel-out/.
FILES="$(git ls-files \
  '*.c' '*.cc' '*.cpp' '*.cxx' \
  '*.h' '*.hh' '*.hpp' \
  || true)"

if [[ -z "${FILES}" ]]; then
  echo "No C/C++ files found to format."
  exit 0
fi

# -i modifies in place. clang-format will pick up .clang-format from repo root.
echo "${FILES}" | xargs -n 50 clang-format -i
echo "clang-format: done"
