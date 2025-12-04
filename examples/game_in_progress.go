package examples

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/encoding/protojson"
)

var GameInProgressJSON = []byte(`{
  "boards": [
    {
      "whitePlayerUuid": "player-white",
      "blackPlayerUuid": "player-black",
      "chessBoard": {
        "uuid": "board-demo",
        "name": "Kaboom Demo Board",
        "pieces": [
          {"type": "KING", "color": "WHITE", "position": {"row": 0, "col": 4}},
          {"type": "QUEEN", "color": "WHITE", "position": {"row": 0, "col": 3}},
          {"type": "ROOK", "color": "WHITE", "position": {"row": 0, "col": 0}},
          {"type": "BISHOP", "color": "WHITE", "position": {"row": 0, "col": 2}},
          {"type": "KNIGHT", "color": "WHITE", "position": {"row": 0, "col": 1}},
          {"type": "PAWN", "color": "WHITE", "position": {"row": 1, "col": 4}},
          {"type": "KING", "color": "BLACK", "position": {"row": 7, "col": 4}},
          {"type": "QUEEN", "color": "BLACK", "position": {"row": 7, "col": 3}},
          {"type": "ROOK", "color": "BLACK", "position": {"row": 7, "col": 0}},
          {"type": "BISHOP", "color": "BLACK", "position": {"row": 7, "col": 2}},
          {"type": "KNIGHT", "color": "BLACK", "position": {"row": 7, "col": 1}},
          {"type": "PAWN", "color": "BLACK", "position": {"row": 6, "col": 3}}
        ]
      },
      "moveHistory": [
        {"cPawnMove": {"from": {"row": 1, "col": 4}, "to": {"row": 3, "col": 4}, "promotion": "QUEEN"}},
        {"cPawnCapture": {"from": {"row": 6, "col": 3}, "to": {"row": 5, "col": 4}, "promotion": "INVALID_PIECE"}},
        {"kPawnBump": {"from": {"row": 3, "col": 4}, "to": {"row": 4, "col": 5}, "promotion": "KNIGHT"}},
        {"kPawnExplosion": {"position": {"row": 5, "col": 4}}},
        {"cKnightMove": {"from": {"row": 0, "col": 1}, "to": {"row": 2, "col": 2}}},
        {"cKnightCapture": {"from": {"row": 7, "col": 1}, "to": {"row": 5, "col": 2}}},
        {"kKnightBump": {"from": {"row": 2, "col": 2}, "to": {"row": 3, "col": 4}, "bumpDirection": "BUMP_DIRECTION_HORIZONTAL"}},
        {"kKnightStomp": {"from": {"row": 5, "col": 2}, "to": {"row": 3, "col": 3}}},
        {"cBishopMove": {"from": {"row": 0, "col": 2}, "to": {"row": 2, "col": 4}}},
        {"cBishopCapture": {"from": {"row": 7, "col": 2}, "to": {"row": 5, "col": 0}}},
        {"kBishopBump": {"from": {"row": 2, "col": 4}, "to": {"row": 4, "col": 6}}},
        {"kBishopSnipe": {"from": {"row": 5, "col": 0}, "target": {"row": 3, "col": 2}}},
        {"cRookMove": {"from": {"row": 0, "col": 0}, "to": {"row": 0, "col": 5}}},
        {"cRookCapture": {"from": {"row": 7, "col": 0}, "to": {"row": 5, "col": 0}}},
        {"kRookBump": {"from": {"row": 0, "col": 5}, "to": {"row": 0, "col": 6}}},
        {"kRookTackle": {"from": {"row": 5, "col": 0}, "to": {"row": 5, "col": 3}}},
        {"cQueenMove": {"from": {"row": 0, "col": 3}, "to": {"row": 1, "col": 4}}},
        {"cQueenCapture": {"from": {"row": 7, "col": 3}, "to": {"row": 5, "col": 5}}},
        {"kQueenBump": {"from": {"row": 1, "col": 4}, "to": {"row": 2, "col": 4}}},
        {"kQueenNova": {"position": {"row": 5, "col": 5}}},
        {"cKingMove": {"from": {"row": 0, "col": 4}, "to": {"row": 1, "col": 4}}},
        {"cKingCapture": {"from": {"row": 7, "col": 4}, "to": {"row": 6, "col": 4}}},
        {"kKingBump": {"from": {"row": 1, "col": 4}, "to": {"row": 2, "col": 5}}},
        {
          "kKingControl": {
            "position": {"row": 2, "col": 5},
            "forcedMove": {
              "cRookMove": {
                "from": {"row": 5, "col": 3},
                "to": {"row": 5, "col": 5}
              }
            }
          }
        }
      ]
    }
  ],
  "players": [
    {"uuid": "player-white", "name": "Alice", "boardUuid": ["board-demo"]},
    {"uuid": "player-black", "name": "Bob", "boardUuid": ["board-demo"]}
  ]
}`)

func GameInProgressProto() *kaboomproto.GameState {
	var state kaboomproto.GameState
	if err := protojson.Unmarshal(GameInProgressJSON, &state); err != nil {
		panic(fmt.Errorf("failed to parse GameInProgressJSON: %w", err))
	}
	return &state
}
