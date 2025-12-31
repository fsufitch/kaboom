#!/usr/bin/env bash
set -euo pipefail

WS="${BUILD_WORKSPACE_DIRECTORY:-}"
if [[ -z "${WS}" ]]; then
  echo "ERROR: BUILD_WORKSPACE_DIRECTORY is not set. Run via: bazel run //:tidy" >&2
  exit 1
fi

cd "${WS}"

if [[ ! -f "compile_commands.json" ]]; then
  cat >&2 <<'EOF'
ERROR: compile_commands.json not found.

Generate it first (example):
  bazel run //:compdb

Then rerun:
  bazel run //:tidy
EOF
  exit 1
fi

# Run clang-tidy on translation units. (Headers are analyzed via includes.)
FILES="$(git ls-files '*.cc' '*.cpp' '*.cxx' || true)"
if [[ -z "${FILES}" ]]; then
  echo "No C++ source files found for clang-tidy."
  exit 0
fi

# clang-tidy will read .clang-tidy automatically from the repo root.
# -p . points to compile_commands.json in the current dir.
echo "${FILES}" | while IFS= read -r f; do
  clang-tidy -p . --quiet "${f}"
done

echo "clang-tidy: done"
