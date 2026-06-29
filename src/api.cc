#include "api.grpc.pb.h"
#include "api.pb.h"
#include "game.pb.h"

#include "new_game.cc"

class KaboomGameEngineImpl final : public kaboomproto::api::KaboomGameEngine::Service
{
  // Implement the gRPC service methods here

  grpc::Status NewTwoPlayerGame(grpc::ServerContext *context, const kaboomproto::api::NewTwoPlayerGameRequest *request, kaboomproto::GameSnapshot *response) override
  {
    auto snap = kaboom::CreateTwoPlayerGame(request->game_id(), request->variant(), request->white_player_id(), request->black_player_id());
    *response = *snap;
    delete snap;

    return grpc::Status::OK;
  }
};
