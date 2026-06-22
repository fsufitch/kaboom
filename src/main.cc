#include <stdio.h>
#include <board.pb.h>
#include <google/protobuf/util/json_util.h>

int main() {
  printf("Hello, world!\n");
  kaboomproto::Board board;
  board.set_id(1);
  board.set_rows(8);
  board.set_cols(8);

  std::string json_string;
  google::protobuf::util::MessageToJsonString(board, &json_string);
  printf("Board as JSON: %s\n", json_string.c_str());

  return 0;

}
