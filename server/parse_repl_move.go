package kaboomserver

import (
	"encoding/json"
	"net/http"
	"strings"

	"google.golang.org/protobuf/encoding/protojson"

	"github.com/fsufitch/kaboom"
)

type parseReplMoveRequest struct {
	ReplMove string `json:"replMove"`
}

type parseReplMoveResponse struct {
	OK    bool            `json:"ok"`
	Error string          `json:"error"`
	Move  json.RawMessage `json:"move"`
}

func handleParseReplMove(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var req parseReplMoveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeParseReplMoveResponse(w, http.StatusBadRequest, false, "invalid JSON body", nil)
		return
	}
	if strings.TrimSpace(req.ReplMove) == "" {
		writeParseReplMoveResponse(w, http.StatusBadRequest, false, "replMove must not be empty", nil)
		return
	}

	move, err := kaboom.ParseReplMove(req.ReplMove)
	if err != nil {
		writeParseReplMoveResponse(w, http.StatusBadRequest, false, err.Error(), nil)
		return
	}

	payload, err := protojson.MarshalOptions{UseProtoNames: true}.Marshal(move.ToProto())
	if err != nil {
		writeParseReplMoveResponse(w, http.StatusInternalServerError, false, "failed to serialize move", nil)
		return
	}

	writeParseReplMoveResponse(w, http.StatusOK, true, "", json.RawMessage(payload))
}

func writeParseReplMoveResponse(w http.ResponseWriter, status int, ok bool, message string, move json.RawMessage) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(parseReplMoveResponse{
		OK:    ok,
		Error: message,
		Move:  move,
	})
}
