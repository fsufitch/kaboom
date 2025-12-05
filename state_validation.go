package kaboom

// TODO: reimplement based on the new immutable state management

// import (
// 	"errors"
// 	"fmt"

// 	kaboomproto "github.com/fsufitch/kaboom/proto/go"
// )

// var ErrGameStateInvalid = errors.New("invalid game state")

// func (tpg TwoPlayerGame) Validate() error {
// 	if tpg.data == nil {
// 		return fmt.Errorf("invalid two player game (data is nil): %w", ErrGameStateInvalid)
// 	}
// 	if len(tpg.data.GetBoards()) != 1 {
// 		return fmt.Errorf("invalid two player game (multiple boards): %w", ErrGameStateInvalid)
// 	}

// 	boardData := tpg.data.GetBoards()[0]
// 	if boardData == nil {
// 		return fmt.Errorf("invalid two player game (board missing data): %w", ErrGameStateInvalid)
// 	}
// 	board := BoardState{data: boardData}

// 	if err := board.Validate(); err != nil {
// 		return fmt.Errorf("invalid two player game (invalid board): %w", err)
// 	}

// 	players, err := tpg.Players()
// 	if err != nil {
// 		return fmt.Errorf("invalid players: %w", err)
// 	}
// 	if len(players) == 0 {
// 		return fmt.Errorf("invalid two player game (no players): %w", ErrGameStateInvalid)
// 	}

// 	playerIndex := map[string]struct{}{}
// 	for i, player := range players {
// 		if err := player.Validate(); err != nil {
// 			return fmt.Errorf("invalid player %d: %w", i, err)
// 		}
// 		playerIndex[player.UUID()] = struct{}{}
// 	}

// 	required := []struct {
// 		label string
// 		uuid  string
// 	}{
// 		{"white", board.WhitePlayerUUID()},
// 		{"black", board.BlackPlayerUUID()},
// 	}
// 	for _, entry := range required {
// 		if entry.uuid == "" {
// 			return fmt.Errorf("invalid board state (%s player uuid missing): %w", entry.label, ErrGameStateInvalid)
// 		}
// 		if _, ok := playerIndex[entry.uuid]; !ok {
// 			return fmt.Errorf("invalid board state (%s player uuid %s unknown): %w", entry.label, entry.uuid, ErrGameStateInvalid)
// 		}
// 	}

// 	return nil
// }

// func (bs BoardState) Validate() error {
// 	if bs.data == nil {
// 		return ErrGameStateInvalid
// 	}

// 	if err := bs.ChessBoard().Validate(); err != nil {
// 		return fmt.Errorf("invalid board state (board invalid): %w", err)
// 	}

// 	moves, err := bs.MoveHistory()
// 	if err != nil {
// 		return fmt.Errorf("invalid move history: %w", err)
// 	}

// 	for i, move := range moves {
// 		if err := validateMove(move); err != nil {
// 			return fmt.Errorf("invalid move %d: %w", i, err)
// 		}
// 	}

// 	return nil
// }

// func (p Player) Validate() error {
// 	if p.data == nil {
// 		return fmt.Errorf("invalid player (data is nil): %w", ErrGameStateInvalid)
// 	}
// 	if p.Name() == "" {
// 		return fmt.Errorf("invalid player (missing name): %w", ErrGameStateInvalid)
// 	}
// 	if p.UUID() == "" {
// 		return fmt.Errorf("invalid player (missing UUID): %w", ErrGameStateInvalid)
// 	}
// 	return nil
// }

// func (cb ChessBoard) Validate() error {
// 	if cb.data == nil {
// 		return fmt.Errorf("invalid chess board (data is nil): %w", ErrGameStateInvalid)
// 	}

// 	pieces, err := cb.Pieces()
// 	if err != nil {
// 		return fmt.Errorf("invalid chess board (pieces): %w", err)
// 	}
// 	seen := map[string]struct{}{}
// 	for i, piece := range pieces {
// 		if err := piece.Validate(); err != nil {
// 			return fmt.Errorf("invalid chess board (piece %d): %w", i, err)
// 		}
// 		pos := piece.Position()
// 		key := fmt.Sprintf("%d,%d", pos.Row(), pos.Col())
// 		if _, exists := seen[key]; exists {
// 			return fmt.Errorf("multiple pieces occupy %s: %w", pos, ErrGameStateInvalid)
// 		}
// 		seen[key] = struct{}{}
// 	}
// 	return nil
// }

// func validateMove(move Move) error {
// 	if move == nil {
// 		return fmt.Errorf("move is nil: %w", ErrGameStateInvalid)
// 	}
// 	if validator, ok := move.(interface{ Validate() error }); ok {
// 		if err := validator.Validate(); err != nil {
// 			return err
// 		}
// 	}
// 	pos := move.PiecePosition()
// 	if pos.data == nil {
// 		return fmt.Errorf("move missing position: %w", ErrGameStateInvalid)
// 	}
// 	if !pos.OnTheBoard() {
// 		return fmt.Errorf("move position off board: %w", ErrGameStateInvalid)
// 	}
// 	if move.Kind() == MoveKind_Unknown {
// 		return fmt.Errorf("move kind unknown: %w", ErrGameStateInvalid)
// 	}
// 	return nil
// }

// func validatePromotionPiece(pt kaboomproto.PieceType, label string) error {
// 	if pt == kaboomproto.PieceType_INVALID_PIECE {
// 		return nil
// 	}
// 	if pt == kaboomproto.PieceType_PAWN {
// 		return fmt.Errorf("%s invalid promotion piece: %w", label, ErrGameStateInvalid)
// 	}
// 	if _, ok := chessPieceTypeToKindMap[pt]; !ok {
// 		return fmt.Errorf("%s unknown promotion piece: %w", label, ErrGameStateInvalid)
// 	}
// 	return nil
// }

// func validateBasePiece(piece baseChessPiece, label string, expected ChessPieceKind) error {
// 	if piece.data == nil {
// 		return fmt.Errorf("invalid %s (data is nil): %w", label, ErrGameStateInvalid)
// 	}
// 	if expected != ChessPieceKindUnknown && piece.Kind() != expected {
// 		return fmt.Errorf("invalid %s (wrong type): %w", label, ErrGameStateInvalid)
// 	}
// 	switch piece.Color() {
// 	case ColorWhite, ColorBlack:
// 	default:
// 		return fmt.Errorf("invalid %s (color invalid): %w", label, ErrGameStateInvalid)
// 	}
// 	if err := piece.Position().Validate(); err != nil {
// 		return fmt.Errorf("invalid %s (position): %w", label, err)
// 	}
// 	return nil
// }

// func validateBaseMove(b baseMove, label string, missingMoveData bool, from func() Position) error {
// 	if b.data == nil {
// 		return fmt.Errorf("invalid %s (missing data): %w", label, ErrGameStateInvalid)
// 	}
// 	if missingMoveData {
// 		return fmt.Errorf("invalid %s (missing move data): %w", label, ErrGameStateInvalid)
// 	}
// 	if err := from().Validate(); err != nil {
// 		return fmt.Errorf("%s (from): %w", label, err)
// 	}
// 	return nil
// }

// // Piece validation implementations.
// func (p Pawn) Validate() error {
// 	return validateBasePiece(p.baseChessPiece, "pawn", ChessPieceKind_Pawn)
// }

// func (k Knight) Validate() error {
// 	return validateBasePiece(k.baseChessPiece, "knight", ChessPieceKind_Knight)
// }

// func (b Bishop) Validate() error {
// 	return validateBasePiece(b.baseChessPiece, "bishop", ChessPieceKind_Bishop)
// }

// func (r Rook) Validate() error {
// 	return validateBasePiece(r.baseChessPiece, "rook", ChessPieceKind_Rook)
// }

// func (q Queen) Validate() error {
// 	return validateBasePiece(q.baseChessPiece, "queen", ChessPieceKind_Queen)
// }

// func (k King) Validate() error {
// 	return validateBasePiece(k.baseChessPiece, "king", ChessPieceKind_King)
// }

// // Move validation implementations.
// func (prm PawnMove) Validate() error {
// 	data := prm.moveData()
// 	if err := validateBaseMove(prm.baseMove, "pawn move", data == nil, prm.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := prm.Destination().Validate(); err != nil {
// 		return fmt.Errorf("pawn move (to): %w", err)
// 	}
// 	if err := validatePromotionPiece(data.GetPromotion(), "pawn move"); err != nil {
// 		return err
// 	}
// 	return nil
// }

// func (pc PawnCapture) Validate() error {
// 	data := pc.moveData()
// 	if err := validateBaseMove(pc.baseMove, "pawn capture", data == nil, pc.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := pc.Destination().Validate(); err != nil {
// 		return fmt.Errorf("pawn capture (to): %w", err)
// 	}
// 	if err := validatePromotionPiece(data.GetPromotion(), "pawn capture"); err != nil {
// 		return err
// 	}
// 	return nil
// }

// func (pb PawnBump) Validate() error {
// 	data := pb.moveData()
// 	if err := validateBaseMove(pb.baseMove, "pawn bump", data == nil, pb.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := pb.Destination().Validate(); err != nil {
// 		return fmt.Errorf("pawn bump (to): %w", err)
// 	}
// 	if err := validatePromotionPiece(data.GetPromotion(), "pawn bump"); err != nil {
// 		return err
// 	}
// 	return nil
// }

// func (pe PawnExplosion) Validate() error {
// 	return validateBaseMove(pe.baseMove, "pawn explosion", pe.moveData() == nil, pe.PiecePosition)
// }

// func (km KnightMove) Validate() error {
// 	data := km.moveData()
// 	if err := validateBaseMove(km.baseMove, "knight move", data == nil, km.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := km.Destination().Validate(); err != nil {
// 		return fmt.Errorf("knight move (to): %w", err)
// 	}
// 	return nil
// }

// func (kc KnightCapture) Validate() error {
// 	data := kc.moveData()
// 	if err := validateBaseMove(kc.baseMove, "knight capture", data == nil, kc.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := kc.Destination().Validate(); err != nil {
// 		return fmt.Errorf("knight capture (to): %w", err)
// 	}
// 	return nil
// }

// func (kb KnightBump) Validate() error {
// 	data := kb.moveData()
// 	if err := validateBaseMove(kb.baseMove, "knight bump", data == nil, kb.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := kb.Destination().Validate(); err != nil {
// 		return fmt.Errorf("knight bump (to): %w", err)
// 	}
// 	if data.GetBumpDirection() == kaboomproto.K_KnightBump_BUMP_DIRECTION_UNKNOWN {
// 		return fmt.Errorf("knight bump missing bump direction: %w", ErrGameStateInvalid)
// 	}
// 	return nil
// }

// func (ks KnightStomp) Validate() error {
// 	data := ks.moveData()
// 	if err := validateBaseMove(ks.baseMove, "knight stomp", data == nil, ks.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := ks.Destination().Validate(); err != nil {
// 		return fmt.Errorf("knight stomp (to): %w", err)
// 	}
// 	return nil
// }

// func (bm BishopMove) Validate() error {
// 	data := bm.moveData()
// 	if err := validateBaseMove(bm.baseMove, "bishop move", data == nil, bm.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := bm.Destination().Validate(); err != nil {
// 		return fmt.Errorf("bishop move (to): %w", err)
// 	}
// 	return nil
// }

// func (bc BishopCapture) Validate() error {
// 	data := bc.moveData()
// 	if err := validateBaseMove(bc.baseMove, "bishop capture", data == nil, bc.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := bc.Destination().Validate(); err != nil {
// 		return fmt.Errorf("bishop capture (to): %w", err)
// 	}
// 	return nil
// }

// func (bb BishopBump) Validate() error {
// 	data := bb.moveData()
// 	if err := validateBaseMove(bb.baseMove, "bishop bump", data == nil, bb.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := bb.Destination().Validate(); err != nil {
// 		return fmt.Errorf("bishop bump (to): %w", err)
// 	}
// 	return nil
// }

// func (bs BishopSnipe) Validate() error {
// 	data := bs.moveData()
// 	if err := validateBaseMove(bs.baseMove, "bishop snipe", data == nil, bs.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := bs.Target().Validate(); err != nil {
// 		return fmt.Errorf("bishop snipe (target): %w", err)
// 	}
// 	return nil
// }

// func (rm RookMove) Validate() error {
// 	data := rm.moveData()
// 	if err := validateBaseMove(rm.baseMove, "rook move", data == nil, rm.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := rm.Destination().Validate(); err != nil {
// 		return fmt.Errorf("rook move (to): %w", err)
// 	}
// 	return nil
// }

// func (rc RookCapture) Validate() error {
// 	data := rc.moveData()
// 	if err := validateBaseMove(rc.baseMove, "rook capture", data == nil, rc.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := rc.Destination().Validate(); err != nil {
// 		return fmt.Errorf("rook capture (to): %w", err)
// 	}
// 	return nil
// }

// func (rb RookBump) Validate() error {
// 	data := rb.moveData()
// 	if err := validateBaseMove(rb.baseMove, "rook bump", data == nil, rb.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := rb.Destination().Validate(); err != nil {
// 		return fmt.Errorf("rook bump (to): %w", err)
// 	}
// 	return nil
// }

// func (rt RookTackle) Validate() error {
// 	data := rt.moveData()
// 	if err := validateBaseMove(rt.baseMove, "rook tackle", data == nil, rt.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := rt.Destination().Validate(); err != nil {
// 		return fmt.Errorf("rook tackle (to): %w", err)
// 	}
// 	return nil
// }

// func (qm QueenMove) Validate() error {
// 	data := qm.moveData()
// 	if err := validateBaseMove(qm.baseMove, "queen move", data == nil, qm.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := qm.Destination().Validate(); err != nil {
// 		return fmt.Errorf("queen move (to): %w", err)
// 	}
// 	return nil
// }

// func (qc QueenCapture) Validate() error {
// 	data := qc.moveData()
// 	if err := validateBaseMove(qc.baseMove, "queen capture", data == nil, qc.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := qc.Destination().Validate(); err != nil {
// 		return fmt.Errorf("queen capture (to): %w", err)
// 	}
// 	return nil
// }

// func (qb QueenBump) Validate() error {
// 	data := qb.moveData()
// 	if err := validateBaseMove(qb.baseMove, "queen bump", data == nil, qb.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := qb.Destination().Validate(); err != nil {
// 		return fmt.Errorf("queen bump (to): %w", err)
// 	}
// 	return nil
// }

// func (qn QueenNova) Validate() error {
// 	return validateBaseMove(qn.baseMove, "queen nova", qn.moveData() == nil, qn.PiecePosition)
// }

// func (km KingMove) Validate() error {
// 	data := km.moveData()
// 	if err := validateBaseMove(km.baseMove, "king move", data == nil, km.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := km.Destination().Validate(); err != nil {
// 		return fmt.Errorf("king move (to): %w", err)
// 	}
// 	return nil
// }

// func (kc KingCapture) Validate() error {
// 	data := kc.moveData()
// 	if err := validateBaseMove(kc.baseMove, "king capture", data == nil, kc.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := kc.Destination().Validate(); err != nil {
// 		return fmt.Errorf("king capture (to): %w", err)
// 	}
// 	return nil
// }

// func (kb KingBump) Validate() error {
// 	data := kb.moveData()
// 	if err := validateBaseMove(kb.baseMove, "king bump", data == nil, kb.PiecePosition); err != nil {
// 		return err
// 	}
// 	if err := kb.Destination().Validate(); err != nil {
// 		return fmt.Errorf("king bump (to): %w", err)
// 	}
// 	return nil
// }

// func (kc KingControl) Validate() error {
// 	data := kc.moveData()
// 	if err := validateBaseMove(kc.baseMove, "king control", data == nil, kc.PiecePosition); err != nil {
// 		return err
// 	}
// 	if data.GetForcedMove() == nil {
// 		return fmt.Errorf("king control missing forced move: %w", ErrGameStateInvalid)
// 	}
// 	forcedKind := kindOfMove(data.GetForcedMove())
// 	constructor, ok := moveKindConstructors[forcedKind]
// 	if !ok {
// 		return fmt.Errorf("king control forced move has unknown kind: %w", ErrGameStateInvalid)
// 	}
// 	forcedMove, err := constructor(data.GetForcedMove())
// 	if err != nil {
// 		return fmt.Errorf("king control forced move invalid: %w", err)
// 	}
// 	return validateMove(forcedMove)
// }
