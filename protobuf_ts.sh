#!/bin/bash
set -eo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROTO_SRC_DIR="$SCRIPT_DIR/src/kaboom/proto"
PROTO_GEN_DIR="$SCRIPT_DIR/src/kaboom/proto/gen"

if [ -z "$PROTOC" ]; then
    PROTOC=$(type -p protoc || true)
else
    echo "Using PROTOC from environment: $PROTOC"
fi
if [ -z "$PROTOC" ]; then
    echo "protoc not found in PATH. Please install the Protocol Buffers compiler."
    exit 1
fi

PROTOC_GEN_TS_PROTO_GUESS="$SCRIPT_DIR/node_modules/.bin/protoc-gen-ts_proto"
if [ -z "$PROTOC_GEN_TS_PROTO" ]; then
    if [ -x "$PROTOC_GEN_TS_PROTO_GUESS" ]; then
        PROTOC_GEN_TS_PROTO="$PROTOC_GEN_TS_PROTO_GUESS"
    else
        PROTOC_GEN_TS_PROTO=$(type -p protoc-gen-ts_proto || true)
    fi
else
    echo "Using PROTOC_GEN_TS_PROTO from environment: $PROTOC_GEN_TS_PROTO"
fi
if [ ! -x "$PROTOC_GEN_TS_PROTO" ]; then
    echo "protoc-gen-ts_proto not found in PATH, at '$PROTOC_GEN_TS_PROTO', or at '$PROTOC_GEN_TS_PROTO_GUESS'."
    echo "Hint: run 'npm install' inside proto/ts to install dependencies, or use the PROTOC_GEN_TS_PROTO environment variable to specify the location of the plugin."
    exit 1
fi

echo "Generating TypeScript code from .proto files..."
echo "  Using protoc: $PROTOC"
echo "  Using ts-proto: $PROTOC_GEN_TS_PROTO"

build() {
    echo "Generating TypeScript stubs from .proto files..."

    TS_PROTO_OPT="" # See: https://github.com/stephenh/ts-proto?tab=readme-ov-file#supported-options
    TS_PROTO_OPT+="esModuleInterop=true," # Enable ES module interoperability
    TS_PROTO_OPT+="env=both,"              # Generate code for both Node.js and browser environments
    # TS_PROTO_OPT+="exportCommonSymbols=false," # Do not export common symbols multiple times, to help with barreling
    TS_PROTO_OPT+="oneof=unions-values,"  # Use union types for oneof fields
    TS_PROTO_OPT+="stringEnums=true"     # Use string enums instead of numeric enums
    TS_PROTO_OPT+="outputSchema=const,"   # Output JSON schema as a const object
    # TS_PROTO_OPT+="outputTypeAnnotations=true" # Output type annotations for better type safety
    TS_PROTO_OPT+="useReadonlyTypes=true," # Use readonly types where applicable
    TS_PROTO_OPT+="comments=true,"        # Preserve comments from .proto files
    TS_PROTO_OPT+="outputIndex=true,"    # Output an index.ts file for easier imports
    TS_PROTO_OPT+="useDate=true,"
    TS_PROTO_OPT="${TS_PROTO_OPT%,}" # Remove trailing comma

    set -ex
    $PROTOC \
        --plugin=protoc-gen-ts_proto="$PROTOC_GEN_TS_PROTO" \
        --ts_proto_out="$PROTO_GEN_DIR" \
        --ts_proto_opt="$TS_PROTO_OPT" \
        --proto_path="$PROTO_SRC_DIR" \
        "$PROTO_SRC_DIR"/*.proto
}

clean() {
    echo "Cleaning generated TypeScript files..."
    set -ex
    rm -rf "$PROTO_GEN_DIR"/*
    mkdir -p "$PROTO_GEN_DIR"
    touch "$PROTO_GEN_DIR/.gitkeep"
}


ACTION=${1:-build}
case "$ACTION" in
    build)
        build
        ;;
    clean)
        clean
        ;;
    *)
        echo "Unknown action: $ACTION"
        echo "Usage: $0 [build|clean]"
        exit 1
        ;;
esac
