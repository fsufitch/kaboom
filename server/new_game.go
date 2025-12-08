package kaboomserver

import (
	"encoding/json"
	"net/http"
	"strings"

	"google.golang.org/protobuf/encoding/protojson"

	"github.com/fsufitch/kaboom/classic"
)

const variantClassic = "classic"

type errorResponse struct {
	Error string `json:"error"`
}

func handleNewGame(w http.ResponseWriter, r *http.Request) {
	variant := strings.ToLower(r.URL.Query().Get("variant"))
	if variant == "" {
		writeJSONError(w, http.StatusBadRequest, "variant query parameter is required")
		return
	}

	switch variant {
	case variantClassic:
		game := classic.NewClassicChessGame("White", "Black").ToProto()
		payload, err := protojson.MarshalOptions{UseProtoNames: true}.Marshal(game)
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "failed to serialize game")
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(payload)
	default:
		writeJSONError(w, http.StatusBadRequest, "unsupported game variant")
	}
}

func writeJSONError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(errorResponse{Error: message})
}
