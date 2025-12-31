#include <google/protobuf/util/json_util.h>
#include <iostream>

#include <kaboomproto/game.pb.h>

int main() {
  kaboomproto::GameSnapshot snapshot = kaboomproto::GameSnapshot();

  auto player1 = snapshot.add_players();
  player1->set_name("Player1");
  player1->set_uuid("uuid-1234");

  auto player2 = snapshot.add_players();
  player2->set_name("Player2");
  player2->set_uuid("uuid-5678");

  google::protobuf::util::JsonPrintOptions options;
  options.add_whitespace = true;

  std::string output;
  auto status =
      google::protobuf::util::MessageToJsonString(snapshot, &output, options);
  if (!status.ok()) {
    std::cerr << "Error converting to JSON: " << status.ToString() << std::endl;
    return 1;
  }

  std::cout << output << std::endl;
  return 0;
}
