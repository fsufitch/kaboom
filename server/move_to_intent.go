package kaboomserver

import (
	"encoding/json"
	"errors"
	"net/http"

	"google.golang.org/protobuf/encoding/protojson"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

type moveToIntentRequest struct {
	Game json.RawMessage `json:"game"`
	Move json.RawMessage `json:"move"`
}

type moveToIntentResponse struct {
	OK     bool            `json:"ok"`
	Error  string          `json:"error"`
	Intent json.RawMessage `json:"intent"`
}

func handleMoveToIntent(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	variant, err := getVariantParam(r)
	if err != nil {
		writeMoveToIntentResponse(w, http.StatusBadRequest, false, err.Error(), nil)
		return
	}

	adjudicator, err := adjudicatorForVariant(variant)
	if err != nil {
		writeMoveToIntentResponse(w, http.StatusBadRequest, false, err.Error(), nil)
		return
	}

	var req moveToIntentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeMoveToIntentResponse(w, http.StatusBadRequest, false, "invalid JSON body", nil)
		return
	}

	if len(req.Game) == 0 {
		writeMoveToIntentResponse(w, http.StatusBadRequest, false, "game is required", nil)
		return
	}

	if len(req.Move) == 0 {
		writeMoveToIntentResponse(w, http.StatusBadRequest, false, "move is required", nil)
		return
	}

	gameProto := &kaboomproto.Game{}
	if err := protojson.Unmarshal(req.Game, gameProto); err != nil {
		writeMoveToIntentResponse(w, http.StatusBadRequest, false, "invalid game payload", nil)
		return
	}

	game := kaboomstate.GameFromProto(gameProto)
	if err := game.Validate(); err != nil {
		writeMoveToIntentResponse(w, http.StatusBadRequest, false, "invalid game: "+err.Error(), nil)
		return
	}

	moveProto := &kaboomproto.KaboomMove{}
	if err := protojson.Unmarshal(req.Move, moveProto); err != nil {
		writeMoveToIntentResponse(w, http.StatusBadRequest, false, "invalid move payload", nil)
		return
	}

	move := kaboomstate.MoveFromProto(moveProto)
	if err := move.Validate(); err != nil {
		writeMoveToIntentResponse(w, http.StatusBadRequest, false, "invalid move: "+err.Error(), nil)
		return
	}

	intent, err := adjudicator.MoveToIntent(game, move)
	if err != nil {
		status := http.StatusBadRequest
		if !errors.Is(err, kaboom.ErrInvalidMove) && !errors.Is(err, kaboom.ErrNotYourTurn) {
			status = http.StatusInternalServerError
		}
		writeMoveToIntentResponse(w, status, false, err.Error(), nil)
		return
	}

	payload, err := protojson.MarshalOptions{UseProtoNames: true}.Marshal(intent.ToProto())
	if err != nil {
		writeMoveToIntentResponse(w, http.StatusInternalServerError, false, "failed to serialize intent", nil)
		return
	}

	writeMoveToIntentResponse(w, http.StatusOK, true, "", json.RawMessage(payload))
}

func writeMoveToIntentResponse(w http.ResponseWriter, status int, ok bool, message string, intent json.RawMessage) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(moveToIntentResponse{
		OK:     ok,
		Error:  message,
		Intent: intent,
	})
}
