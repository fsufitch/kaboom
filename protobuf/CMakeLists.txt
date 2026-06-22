find_package(Protobuf REQUIRED)

# Build the actual protobuf library, to statically link it

protobuf_generate_cpp(PROTO_SRCS PROTO_HDRS
  board.proto
  piece.proto
  move.proto
  variant_kaboom.proto
  variant_classic.proto
)

add_library(kaboom_proto STATIC)

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
)
