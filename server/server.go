package kaboomserver

import (
	"net/http"

	"github.com/gorilla/mux"
)

// NewServer constructs an HTTP handler that exposes the rules engine API.
func NewServer() http.Handler {
	router := mux.NewRouter()
	router.HandleFunc("/new-game", handleNewGame).Methods(http.MethodPost)
	return router
}
