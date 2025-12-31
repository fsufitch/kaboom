#!/bin/bash

REPO_DIR="$1"
if [[ -z "${REPO_DIR}" ]]; then
  echo "Usage: $0 <path-to-repo>"
  exit 1
fi
REPO_DIR="$(cd "${REPO_DIR}" && pwd)"
cd "${REPO_DIR}"

KABOOM_BAZEL_CACHE="/bazel-cache"
if [[ -d "${KABOOM_BAZEL_CACHE}" ]]; then
  echo "Using mounted bazel cache at ${KABOOM_BAZEL_CACHE}"
else
  echo "Mounted bazel cache not found at ${KABOOM_BAZEL_CACHE}; using default location."
  KABOOM_BAZEL_CACHE="${REPO_DIR}/.bazel_cache"
fi

echo "Bazel cache directory: ${KABOOM_BAZEL_CACHE}"

if [[ ! -d "${KABOOM_BAZEL_CACHE}/cache" ]]; then
  mkdir -p "${KABOOM_BAZEL_CACHE}/cache"
fi
if [[ ! -d "${KABOOM_BAZEL_CACHE}/repo_cache" ]]; then
  mkdir -p "${KABOOM_BAZEL_CACHE}/repo_cache"
fi

# Create .bazelrc.local with devcontainer-specific Bazel settings.
if [[ -f .bazelrc.local ]]; then
  echo ".bazelrc.local already exists; skipping generation."
else
  echo "Generating .bazelrc.local with devcontainer-specific settings."
  cat > .bazelrc.local <<EOF
# Use mounted space for Bazel cache and repository cache, to avoid overlayfs performance issues.
startup --output_user_root=${KABOOM_BAZEL_CACHE}/cache
common --repository_cache=${KABOOM_BAZEL_CACHE}/repo_cache
EOF
fi

# Generate compile_commands.json for clangd and clang-tidy.
if [[ -f compile_commands.json ]]; then
  echo "compile_commands.json already exists; skipping generation."
else
  echo "Generating compile_commands.json using Bazel."
  bazel run //:compdb
fi
