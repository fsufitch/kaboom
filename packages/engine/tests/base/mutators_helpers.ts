import {
  ChessBoard,
  ChessColor,
  ChessPiece,
  ChessPieceKind,
  Flag,
  GameSnapshot,
  Place,
  Variant,
} from '@kaboom/proto';

export const BOARD_ID = 'board-1';

export const mkBoard = (overrides: Partial<ChessBoard> = {}): ChessBoard =>
  ChessBoard.create({
    id: BOARD_ID,
    rows: 8,
    columns: 8,
    activeColor: ChessColor.WHITE,
    ...overrides,
  });

export const mkPiece = (options: {
  id: string;
  kind?: ChessPieceKind;
  color?: ChessColor;
  place?: Place;
  row?: number;
  column?: number;
}): ChessPiece => {
  const {
    id,
    kind = ChessPieceKind.PAWN,
    color = ChessColor.WHITE,
    place,
    row = 0,
    column = 0,
  } = options;

  return ChessPiece.create({
    id,
    kind,
    color,
    place: place ?? Place.create({ boardId: BOARD_ID, boardPosition: { row, column } }),
  });
};

export const mkFlag = (id: string): Flag => Flag.create({ id });

export const mkSnapshot = (options: {
  boards?: ChessBoard[];
  pieces?: ChessPiece[];
  flags?: Flag[];
} = {}): GameSnapshot =>
  GameSnapshot.create({
    properties: { id: 'game-1', variant: Variant.CLASSIC },
    boards: options.boards ?? [mkBoard()],
    pieces: options.pieces ?? [],
    flags: options.flags ?? [],
    players: [],
    boardPlayers: [],
    turnHistory: [],
  });
