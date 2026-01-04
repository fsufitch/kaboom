#!/bin/bash
set -eo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROTO_DIR="$SCRIPT_DIR/src/kaboom/proto"

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
    set -ex
    $PROTOC \
        --plugin=protoc-gen-ts_proto="$PROTOC_GEN_TS_PROTO" \
        --ts_proto_out="$PROTO_DIR" \
        --ts_proto_opt=esModuleInterop=true,outputServices=generic-definitions,useOptionals=messages,env=node \
        --proto_path="$PROTO_DIR" \
        "$PROTO_DIR"/*.proto
}

clean() {
    echo "Cleaning generated TypeScript files..."
    set -ex
    rm -rf "$PROTO_DIR"/*.ts
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
