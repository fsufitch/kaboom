import {
  ChessBoard,
  ChessBoardPlayer,
  ChessColor,
  ChessPiece,
  ChessPieceKind,
  GameSnapshot,
  Player,
  Variant,
} from '@kaboom/proto';
import { newReadonlyArray } from '@kaboom/engine/base';

export const newClassicChessGame = (opts?: Partial<NewGameOpts>): GameSnapshot => {
  const gOpts = { ...defaultNewGameOpts, ...opts };
  const snapshot: GameSnapshot = GameSnapshot.create({
    properties: {
      id: gOpts.gameId,
      variant: Variant.CLASSIC,
    },
    players: newReadonlyArray(
      {
        id: gOpts.whitePlayerId,
        name: gOpts.whitePlayerName,
      },
      {
        id: gOpts.blackPlayerId,
        name: gOpts.blackPlayerName,
      },
    ),
    boards: newReadonlyArray({
      id: 'classic-board',
      columns: 8,
      rows: 8,
      activeColor: ChessColor.WHITE,
    }),
    boardPlayers: newReadonlyArray(
      {
        boardId: 'classic-board',
        playerId: gOpts.whitePlayerId,
        color: ChessColor.WHITE,
      },
      {
        boardId: 'classic-board',
        playerId: gOpts.blackPlayerId,
        color: ChessColor.BLACK,
      },
    ),
    pieces: newReadonlyArray(
      ...classicChessPieceSetup.map(([color, kind, row, column, id]) =>
        ChessPiece.create({
          id,
          color,
          kind,
          place: {
            boardId: 'classic-board',
            boardPosition: { row, column },
          },
        }),
      ),
    ),
  });

  return snapshot;
};

export interface NewGameOpts {
  gameId: string;
  whitePlayerId: string;
  whitePlayerName: string;
  blackPlayerId: string;
  blackPlayerName: string;
}

const defaultNewGameOpts: NewGameOpts = {
  gameId: 'game-1',
  whitePlayerId: 'player-1',
  whitePlayerName: 'White Player',
  blackPlayerId: 'player-2',
  blackPlayerName: 'Black Player',
};

const classicChessPieceSetup: readonly [ChessColor, ChessPieceKind, number, number, string][] = [
  // [color, kind, row, col, id]; rows and columns are 0-indexed at the bottom-left

  [ChessColor.WHITE, ChessPieceKind.ROOK, 0, 0, 'wr1'],
  [ChessColor.WHITE, ChessPieceKind.KNIGHT, 0, 1, 'wn1'],
  [ChessColor.WHITE, ChessPieceKind.BISHOP, 0, 2, 'wb1'],
  [ChessColor.WHITE, ChessPieceKind.QUEEN, 0, 3, 'wq'],
  [ChessColor.WHITE, ChessPieceKind.KING, 0, 4, 'wk'],
  [ChessColor.WHITE, ChessPieceKind.BISHOP, 0, 5, 'wb2'],
  [ChessColor.WHITE, ChessPieceKind.KNIGHT, 0, 6, 'wn2'],
  [ChessColor.WHITE, ChessPieceKind.ROOK, 0, 7, 'wr2'],
  [ChessColor.WHITE, ChessPieceKind.PAWN, 1, 0, 'wp1'],
  [ChessColor.WHITE, ChessPieceKind.PAWN, 1, 1, 'wp2'],
  [ChessColor.WHITE, ChessPieceKind.PAWN, 1, 2, 'wp3'],
  [ChessColor.WHITE, ChessPieceKind.PAWN, 1, 3, 'wp4'],
  [ChessColor.WHITE, ChessPieceKind.PAWN, 1, 4, 'wp5'],
  [ChessColor.WHITE, ChessPieceKind.PAWN, 1, 5, 'wp6'],
  [ChessColor.WHITE, ChessPieceKind.PAWN, 1, 6, 'wp7'],
  [ChessColor.WHITE, ChessPieceKind.PAWN, 1, 7, 'wp8'],

  [ChessColor.BLACK, ChessPieceKind.ROOK, 7, 0, 'br1'],
  [ChessColor.BLACK, ChessPieceKind.KNIGHT, 7, 1, 'bn1'],
  [ChessColor.BLACK, ChessPieceKind.BISHOP, 7, 2, 'bb1'],
  [ChessColor.BLACK, ChessPieceKind.QUEEN, 7, 3, 'bq'],
  [ChessColor.BLACK, ChessPieceKind.KING, 7, 4, 'bk'],
  [ChessColor.BLACK, ChessPieceKind.BISHOP, 7, 5, 'bb2'],
  [ChessColor.BLACK, ChessPieceKind.KNIGHT, 7, 6, 'bn2'],
  [ChessColor.BLACK, ChessPieceKind.ROOK, 7, 7, 'br2'],
  [ChessColor.BLACK, ChessPieceKind.PAWN, 6, 0, 'bp1'],
  [ChessColor.BLACK, ChessPieceKind.PAWN, 6, 1, 'bp2'],
  [ChessColor.BLACK, ChessPieceKind.PAWN, 6, 2, 'bp3'],
  [ChessColor.BLACK, ChessPieceKind.PAWN, 6, 3, 'bp4'],
  [ChessColor.BLACK, ChessPieceKind.PAWN, 6, 4, 'bp5'],
  [ChessColor.BLACK, ChessPieceKind.PAWN, 6, 5, 'bp6'],
  [ChessColor.BLACK, ChessPieceKind.PAWN, 6, 6, 'bp7'],
  [ChessColor.BLACK, ChessPieceKind.PAWN, 6, 7, 'bp8'],
];
