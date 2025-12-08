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

type intentToEffectRequest struct {
	Game   json.RawMessage `json:"game"`
	Intent json.RawMessage `json:"intent"`
}

type intentToEffectResponse struct {
	OK      bool              `json:"ok"`
	Error   string            `json:"error"`
	Effects []json.RawMessage `json:"effects"`
}

func handleIntentToEffect(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	variant, err := getVariantParam(r)
	if err != nil {
		writeIntentToEffectResponse(w, http.StatusBadRequest, false, err.Error(), nil)
		return
	}

	adjudicator, err := adjudicatorForVariant(variant)
	if err != nil {
		writeIntentToEffectResponse(w, http.StatusBadRequest, false, err.Error(), nil)
		return
	}

	var req intentToEffectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeIntentToEffectResponse(w, http.StatusBadRequest, false, "invalid JSON body", nil)
		return
	}

	if len(req.Game) == 0 {
		writeIntentToEffectResponse(w, http.StatusBadRequest, false, "game is required", nil)
		return
	}

	if len(req.Intent) == 0 {
		writeIntentToEffectResponse(w, http.StatusBadRequest, false, "intent is required", nil)
		return
	}

	gameProto := &kaboomproto.Game{}
	if err := protojson.Unmarshal(req.Game, gameProto); err != nil {
		writeIntentToEffectResponse(w, http.StatusBadRequest, false, "invalid game payload", nil)
		return
	}

	game := kaboomstate.GameFromProto(gameProto)
	if err := game.Validate(); err != nil {
		writeIntentToEffectResponse(w, http.StatusBadRequest, false, "invalid game: "+err.Error(), nil)
		return
	}

	intentProto := &kaboomproto.Intent{}
	if err := protojson.Unmarshal(req.Intent, intentProto); err != nil {
		writeIntentToEffectResponse(w, http.StatusBadRequest, false, "invalid intent payload", nil)
		return
	}

	intent := kaboomstate.IntentFromProto(intentProto)
	if err := intent.Validate(); err != nil {
		writeIntentToEffectResponse(w, http.StatusBadRequest, false, "invalid intent: "+err.Error(), nil)
		return
	}

	effects, err := adjudicator.IntentToEffects(game, intent)
	if err != nil {
		status := http.StatusBadRequest
		if !errors.Is(err, kaboom.ErrInvalidMove) && !errors.Is(err, kaboom.ErrNotYourTurn) {
			status = http.StatusInternalServerError
		}
		writeIntentToEffectResponse(w, status, false, err.Error(), nil)
		return
	}

	payloads := make([]json.RawMessage, len(effects))
	for i, effect := range effects {
		data, err := protojson.MarshalOptions{UseProtoNames: true}.Marshal(effect.ToProto())
		if err != nil {
			writeIntentToEffectResponse(w, http.StatusInternalServerError, false, "failed to serialize effects", nil)
			return
		}
		payloads[i] = json.RawMessage(data)
	}

	writeIntentToEffectResponse(w, http.StatusOK, true, "", payloads)
}

func writeIntentToEffectResponse(w http.ResponseWriter, status int, ok bool, message string, effects []json.RawMessage) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(intentToEffectResponse{
		OK:      ok,
		Error:   message,
		Effects: effects,
	})
}
