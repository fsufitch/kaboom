#!/bin/bash

REPO_DIR="$1"
if [[ -z "${REPO_DIR}" ]]; then
  echo "Usage: $0 <path-to-repo>"
  exit 1
fi
cd "${REPO_DIR}"

# Create .bazelrc.local with devcontainer-specific Bazel settings.
if [[ -f .bazelrc.local ]]; then
  echo ".bazelrc.local already exists; skipping generation."
else
  echo "Generating .bazelrc.local with devcontainer-specific settings."
  cat > .bazelrc.local <<EOF
  # Use mounted space for Bazel cache and repository cache, to avoid overlayfs performance issues.
startup --output_user_root=$(pwd)/.bazel_cache
common --repository_cache=$(pwd)/.bazel_repo_cache
EOF
fi

# Generate compile_commands.json for clangd and clang-tidy.
bazel run //:compdb