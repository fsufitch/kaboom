import {
  ChessBoard,
  ChessBoardPlayer,
  ChessColor,
  ChessPiece,
  ChessPieceKind,
  ExecutedTurn,
  Flag,
  GameSnapshot,
  Place,
  Player,
  Variant,
} from '@kaboom/proto';

import { newReadonlyArray } from '@kaboom/engine/base/types';

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
  boards?: readonly ChessBoard[];
  pieces?: readonly ChessPiece[];
  flags?: readonly Flag[];
} = {}): GameSnapshot =>
  GameSnapshot.create({
    properties: { id: 'game-1', variant: Variant.CLASSIC },
    boards: newReadonlyArray(...(options.boards ?? [mkBoard()])),
    pieces: newReadonlyArray(...(options.pieces ?? [])),
    flags: newReadonlyArray(...(options.flags ?? [])),
    players: newReadonlyArray<Player>(),
    boardPlayers: newReadonlyArray<ChessBoardPlayer>(),
    turnHistory: newReadonlyArray<ExecutedTurn>(),
  });
