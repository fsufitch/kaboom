package kaboomserver

import (
	"encoding/json"
	"fmt"
	"net/http"

	"google.golang.org/protobuf/encoding/protojson"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

type applyEffectsRequest struct {
	Game    json.RawMessage   `json:"game"`
	Effects []json.RawMessage `json:"effects"`
}

type applyEffectsResponse struct {
	OK    bool            `json:"ok"`
	Error string          `json:"error"`
	Game  json.RawMessage `json:"game"`
}

func handleApplyEffects(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var req applyEffectsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeApplyEffectsResponse(w, http.StatusBadRequest, false, "invalid JSON body", nil)
		return
	}

	if len(req.Game) == 0 {
		writeApplyEffectsResponse(w, http.StatusBadRequest, false, "game is required", nil)
		return
	}

	if req.Effects == nil {
		writeApplyEffectsResponse(w, http.StatusBadRequest, false, "effects are required", nil)
		return
	}

	gameProto := &kaboomproto.Game{}
	if err := protojson.Unmarshal(req.Game, gameProto); err != nil {
		writeApplyEffectsResponse(w, http.StatusBadRequest, false, "invalid game payload", nil)
		return
	}

	game := kaboomstate.GameFromProto(gameProto)
	if err := game.Validate(); err != nil {
		writeApplyEffectsResponse(w, http.StatusBadRequest, false, "invalid game: "+err.Error(), nil)
		return
	}

	effects := make([]*kaboomstate.Effect, 0, len(req.Effects))
	for idx, raw := range req.Effects {
		effectProto := &kaboomproto.Effect{}
		if err := protojson.Unmarshal(raw, effectProto); err != nil {
			writeApplyEffectsResponse(w, http.StatusBadRequest, false, fmt.Sprintf("invalid effect at index %d", idx), nil)
			return
		}

		effect := kaboomstate.EffectFromProto(effectProto)
		if err := effect.Validate(); err != nil {
			writeApplyEffectsResponse(w, http.StatusBadRequest, false, fmt.Sprintf("invalid effect at index %d: %v", idx, err), nil)
			return
		}

		effectCopy := effect
		effects = append(effects, &effectCopy)
	}

	nextGame, err := kaboomstate.ApplyEffects(game, effects)
	if err != nil {
		writeApplyEffectsResponse(w, http.StatusBadRequest, false, err.Error(), nil)
		return
	}

	payload, err := protojson.MarshalOptions{UseProtoNames: true}.Marshal(nextGame.ToProto())
	if err != nil {
		writeApplyEffectsResponse(w, http.StatusInternalServerError, false, "failed to serialize updated game", nil)
		return
	}

	writeApplyEffectsResponse(w, http.StatusOK, true, "", json.RawMessage(payload))
}

func writeApplyEffectsResponse(w http.ResponseWriter, status int, ok bool, message string, game json.RawMessage) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(applyEffectsResponse{
		OK:    ok,
		Error: message,
		Game:  game,
	})
}
