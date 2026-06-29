find_package(Protobuf REQUIRED)
find_package(gRPC CONFIG REQUIRED)

# Build the actual protobuf library, to statically link it

add_library(kaboom_proto STATIC
  api.proto
  board.proto
  common.proto
  game.proto
  move.proto
  piece.proto
  variant_classic.proto
  variant_kaboom.proto
)

target_sources(kaboom_proto
  PRIVATE
    ${PROTO_SRCS}
  PUBLIC
    FILE_SET myHeaders
    TYPE HEADERS
    BASE_DIRS ${CMAKE_CURRENT_BINARY_DIR}
    FILES ${PROTO_HDRS}
)

target_link_libraries(kaboom_proto
  PRIVATE
    protobuf::libprotobuf
    gRPC::grpc++
)

protobuf_generate(
  TARGET kaboom_proto
  LANGUAGE cpp
)

protobuf_generate(
  TARGET kaboom_proto
  LANGUAGE grpc
  PLUGIN protoc-gen-grpc=$<TARGET_FILE:gRPC::grpc_cpp_plugin>
  PLUGIN_OPTIONS generate_mock_code=true
  GENERATE_EXTENSIONS .grpc.pb.h .grpc.pb.cc
)
