package kaboomserver

import (
	"net/http"

	"github.com/gorilla/mux"
)

// NewServer constructs an HTTP handler that exposes the rules engine API.
func NewServer() http.Handler {
	router := mux.NewRouter()
	router.HandleFunc("/new-game", handleNewGame).Methods(http.MethodPost)
	router.HandleFunc("/parse-repl-move", handleParseReplMove).Methods(http.MethodPost)
	router.HandleFunc("/move-to-intent", handleMoveToIntent).Methods(http.MethodPost)
	router.HandleFunc("/intent-to-effect", handleIntentToEffect).Methods(http.MethodPost)
	router.HandleFunc("/apply-effects", handleApplyEffects).Methods(http.MethodPost)
	router.HandleFunc("/evaluate-move", handleEvaluateMove).Methods(http.MethodPost)
	return router
}
