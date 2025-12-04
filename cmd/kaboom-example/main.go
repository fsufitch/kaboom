package main

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/encoding/protojson"
)

func main() {
	fmt.Println("Hello, World!")

	gameState := kaboomproto.GameState{}

	byts, err := protojson.MarshalOptions{
		Multiline:         true,
		Indent:            " ",
		EmitUnpopulated:   true,
		EmitDefaultValues: true,
	}.Marshal(&gameState)

	if err != nil {
		panic(err)
	}

	fmt.Println(string(byts))

}
