package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type Game struct {
	proto *kaboomproto.Game
}

func GameFromProto(g *kaboomproto.Game) Game {
	return Game{proto: g}
}

func (g Game) ToProto() *kaboomproto.Game {
	return proto.CloneOf(g.proto)
}

func (g Game) Clone() Game {
	return GameFromProto(g.ToProto())
}

func (g Game) Validate() error {
	if g.proto == nil {
		return fmt.Errorf("%w: game data is null", ErrInvalidProto)
	}

	if g.UUID() == "" {
		return fmt.Errorf("%w: game uuid is empty", ErrInvalidProto)
	}

	if g.RulesVariant() == "" {
		return fmt.Errorf("%w: game rules variant is empty", ErrInvalidProto)
	}

	for _, board := range g.Boards() {
		if err := board.Validate(); err != nil {
			return err
		}
	}

	for _, player := range g.Players() {
		if err := player.Validate(); err != nil {
			return err
		}
	}

	for _, piece := range g.Pieces() {
		if err := piece.Validate(); err != nil {
			return err
		}
	}

	for _, turn := range g.Turns() {
		if err := turn.Validate(); err != nil {
			return err
		}
	}

	return nil
}

func (g Game) UUID() string {
	return g.proto.GetUuid()
}

func (g Game) RulesVariant() string {
	return g.proto.GetRulesVariant()
}

func (g Game) Boards() []Board {
	boards := g.proto.GetBoards()
	result := make([]Board, len(boards))
	for i, b := range boards {
		result[i] = BoardFromProto(b)
	}
	return result
}

func (g Game) Players() []Player {
	players := g.proto.GetPlayers()
	result := make([]Player, len(players))
	for i, p := range players {
		result[i] = PlayerFromProto(p)
	}
	return result
}

func (g Game) Pieces() []ChessPiece {
	pieces := g.proto.GetPieces()
	result := make([]ChessPiece, len(pieces))
	for i, p := range pieces {
		result[i] = ChessPieceFromProto(p)
	}
	return result
}

func (g Game) Turns() []Turn {
	turns := g.proto.GetTurns()
	result := make([]Turn, len(turns))
	for i, t := range turns {
		result[i] = TurnFromProto(t)
	}
	return result
}

func (g Game) GetBoard(uuid string) (Board, bool) {
	for _, board := range g.Boards() {
		if board.UUID() == uuid {
			return board, true
		}
	}
	return Board{}, false
}

func (g Game) FindPlayer(uuid string) (Player, bool) {
	for _, player := range g.Players() {
		if player.UUID() == uuid {
			return player, true
		}
	}
	return Player{}, false
}

func (g Game) GetPiece(uuid string) (ChessPiece, bool) {
	for _, piece := range g.Pieces() {
		if piece.UUID() == uuid {
			return piece, true
		}
	}
	return ChessPiece{}, false
}

func (g Game) GetPieceAt(boardUUID string, position Position) (ChessPiece, error) {
	var foundPiece *ChessPiece

	if _, ok := g.GetBoard(boardUUID); !ok {
		return ChessPiece{}, fmt.Errorf("board not found (board=%s)", boardUUID)
	}

	for _, piece := range g.Pieces() {
		if boardUUID != "" && piece.BoardUUID() != boardUUID {
			continue
		}

		if piece.Zone().Value() != kaboomproto.ZoneKind_ZONE_BOARD {
			continue
		}

		if piece.Position().Equals(position) {
			if foundPiece != nil {
				return ChessPiece{}, fmt.Errorf("multiple pieces found (board=%s row=%d col=%d)", boardUUID, position.Row(), position.Col())
			}
			foundPiece = &piece
		}
	}

	if foundPiece == nil {
		return ChessPiece{}, ErrPieceNotFound{BoardUUID: boardUUID, Position: position}
	}

	return *foundPiece, nil
}

type Turn struct {
	proto *kaboomproto.Turn
}

func TurnFromProto(t *kaboomproto.Turn) Turn {
	return Turn{proto: t}
}

func (t Turn) ToProto() *kaboomproto.Turn {
	return proto.CloneOf(t.proto)
}

func (t Turn) Clone() Turn {
	return TurnFromProto(t.ToProto())
}

func (t Turn) Validate() error {
	if t.proto == nil {
		return fmt.Errorf("%w: turn data is null", ErrInvalidProto)
	}

	if t.UUID() == "" {
		return fmt.Errorf("%w: turn uuid is empty", ErrInvalidProto)
	}

	if t.PlayerUUID() == "" {
		return fmt.Errorf("%w: turn missing player uuid", ErrInvalidProto)
	}

	for _, intent := range t.Intents() {
		if err := intent.Validate(); err != nil {
			return err
		}
	}

	for _, effect := range t.Effects() {
		if err := effect.Validate(); err != nil {
			return err
		}
	}

	return nil
}

func (t Turn) UUID() string {
	return t.proto.GetUuid()
}

func (t Turn) PlayerUUID() string {
	return t.proto.GetPlayerUuid()
}

func (t Turn) Intents() []Intent {
	intents := t.proto.GetIntents()
	result := make([]Intent, len(intents))
	for i, intent := range intents {
		result[i] = IntentFromProto(intent)
	}
	return result
}

func (t Turn) Effects() []Effect {
	effects := t.proto.GetEffects()
	result := make([]Effect, len(effects))
	for i, effect := range effects {
		result[i] = EffectFromProto(effect)
	}
	return result
}
