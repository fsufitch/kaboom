package kaboomserver

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"google.golang.org/protobuf/encoding/protojson"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

type evaluateMoveRequest struct {
	ReplMove string          `json:"replMove"`
	Move     json.RawMessage `json:"move"`
	Game     json.RawMessage `json:"game"`
}

type evaluateMoveResponse struct {
	OK    bool            `json:"ok"`
	Error string          `json:"error"`
	Game  json.RawMessage `json:"game"`
}

func handleEvaluateMove(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	variant, err := getVariantParam(r)
	if err != nil {
		writeEvaluateMoveResponse(w, http.StatusBadRequest, false, err.Error(), nil)
		return
	}

	adjudicator, err := adjudicatorForVariant(variant)
	if err != nil {
		writeEvaluateMoveResponse(w, http.StatusBadRequest, false, err.Error(), nil)
		return
	}

	var req evaluateMoveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeEvaluateMoveResponse(w, http.StatusBadRequest, false, "invalid JSON body", nil)
		return
	}

	if len(req.Game) == 0 {
		writeEvaluateMoveResponse(w, http.StatusBadRequest, false, "game is required", nil)
		return
	}

	hasReplMove := strings.TrimSpace(req.ReplMove) != ""
	hasMove := len(req.Move) != 0
	if hasReplMove == hasMove {
		writeEvaluateMoveResponse(w, http.StatusBadRequest, false, "exactly one of replMove or move must be provided", nil)
		return
	}

	gameProto := &kaboomproto.Game{}
	if err := protojson.Unmarshal(req.Game, gameProto); err != nil {
		writeEvaluateMoveResponse(w, http.StatusBadRequest, false, "invalid game payload", nil)
		return
	}

	game := kaboomstate.GameFromProto(gameProto)
	if err := game.Validate(); err != nil {
		writeEvaluateMoveResponse(w, http.StatusBadRequest, false, "invalid game: "+err.Error(), nil)
		return
	}

	var move kaboomstate.Move
	if hasReplMove {
		parsedMove, err := kaboom.ParseReplMove(req.ReplMove)
		if err != nil {
			writeEvaluateMoveResponse(w, http.StatusBadRequest, false, "invalid replMove: "+err.Error(), nil)
			return
		}
		move = parsedMove
	} else {
		moveProto := &kaboomproto.KaboomMove{}
		if err := protojson.Unmarshal(req.Move, moveProto); err != nil {
			writeEvaluateMoveResponse(w, http.StatusBadRequest, false, "invalid move payload", nil)
			return
		}
		move = kaboomstate.MoveFromProto(moveProto)
		if err := move.Validate(); err != nil {
			writeEvaluateMoveResponse(w, http.StatusBadRequest, false, "invalid move: "+err.Error(), nil)
			return
		}
	}

	intent, err := adjudicator.MoveToIntent(game, move)
	if err != nil {
		writeEvaluateMoveError(w, err)
		return
	}

	effects, err := adjudicator.IntentToEffects(game, *intent)
	if err != nil {
		writeEvaluateMoveError(w, err)
		return
	}

	nextGame, err := kaboomstate.ApplyEffects(game, effects)
	if err != nil {
		writeEvaluateMoveResponse(w, http.StatusBadRequest, false, fmt.Sprintf("failed to apply effects: %v", err), nil)
		return
	}

	payload, err := protojson.MarshalOptions{UseProtoNames: true}.Marshal(nextGame.ToProto())
	if err != nil {
		writeEvaluateMoveResponse(w, http.StatusInternalServerError, false, "failed to serialize game", nil)
		return
	}

	writeEvaluateMoveResponse(w, http.StatusOK, true, "", json.RawMessage(payload))
}

func writeEvaluateMoveError(w http.ResponseWriter, err error) {
	status := http.StatusBadRequest
	if !errors.Is(err, kaboom.ErrInvalidMove) && !errors.Is(err, kaboom.ErrNotYourTurn) {
		status = http.StatusInternalServerError
	}
	writeEvaluateMoveResponse(w, status, false, err.Error(), nil)
}

func writeEvaluateMoveResponse(w http.ResponseWriter, status int, ok bool, message string, game json.RawMessage) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(evaluateMoveResponse{
		OK:    ok,
		Error: message,
		Game:  game,
	})
}
