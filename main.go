package main

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"

	pb "google.golang.org/protobuf/proto"
)

func main() {
	fmt.Println("Hello, World!")

	gameState := kaboomproto.GameState{}
	fmt.Println(gameState.String())

	pb.Marshal(&gameState)

}
