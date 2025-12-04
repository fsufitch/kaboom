#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

PROTOC=$(type -p protoc)
if [ -z "$PROTOC" ]; then
    echo "protoc not found in PATH. Please install Protocol Buffers compiler."
    exit 1
fi

PROTOC_GEN_GO="$(type -p protoc-gen-go || echo "$(go env GOPATH)/bin/protoc-gen-go")"
if [ ! -x "$PROTOC_GEN_GO" ]; then
    echo "protoc-gen-go not found in PATH or GOPATH. Please install the Go Protocol Buffers plugin."
    echo "Hint: run 'go install google.golang.org/protobuf/cmd/protoc-gen-go@latest'"
    exit 1
fi

echo "Generating Go code from .proto files..."
echo "  Using protoc: $PROTOC"
echo "  Using protoc-gen-go: $PROTOC_GEN_GO"

(
    set -ex;
    $PROTOC \
        --plugin=protoc-gen-go="$PROTOC_GEN_GO" \
        --go_opt=paths=source_relative \
        --proto_path="$SCRIPT_DIR/src" \
        --go_out="$SCRIPT_DIR/go" \
        "$SCRIPT_DIR"/src/*.proto
)