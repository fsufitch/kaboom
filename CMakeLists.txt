cmake_minimum_required(VERSION 4.3)

set(CMAKE_C_COMPILER clang)
set(CMAKE_CXX_COMPILER clang++)

project(kaboom
  VERSION 0.1.0
  DESCRIPTION "A chess rules engine."
  HOMEPAGE_URL "https://github.com/fsufitch/kaboom"
  LANGUAGES C CXX
)

add_executable(kaboom)

target_sources(kaboom
  PRIVATE
    src/main.cc
)

add_subdirectory(protobuf)

target_link_libraries(kaboom
  PRIVATE
    kaboom_proto
)
