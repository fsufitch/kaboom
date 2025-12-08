package main

import (
	"log"
	"net"
	"net/http"
	"os"

	kaboomserver "github.com/fsufitch/kaboom/server"
)

const (
	defaultHost = "localhost"
	defaultPort = "8700"
)

func main() {
	host := getEnv("KABOOM_HOST", defaultHost)
	port := getEnv("KABOOM_PORT", defaultPort)
	addr := net.JoinHostPort(host, port)

	handler := kaboomserver.NewServer()
	log.Printf("kaboom server listening on %s", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("server exited with error: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
