import { newReadonlyArray } from '@kaboom/engine/base';
import {
  ChessBoard,
  ChessColor,
  ChessPiece,
  ChessPieceKind,
  Effect,
  ExecutedTurn,
  GameSnapshot,
  Move,
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
  row?: number;
  column?: number;
}): ChessPiece => {
  const { id, kind = ChessPieceKind.PAWN, color = ChessColor.WHITE, row = 0, column = 0 } = options;

  return ChessPiece.create({
    id,
    kind,
    color,
    place: {
      boardId: BOARD_ID,
      boardPosition: { row, column },
    },
  });
};

export const mkSnapshot = (
  options: {
    boards?: readonly ChessBoard[];
    pieces?: readonly ChessPiece[];
    turnHistory?: readonly ExecutedTurn[];
  } = {},
): GameSnapshot =>
  GameSnapshot.create({
    properties: { id: 'game-1', variant: Variant.CLASSIC },
    boards: newReadonlyArray(...(options.boards ?? [mkBoard()])),
    pieces: newReadonlyArray(...(options.pieces ?? [])),
    players: newReadonlyArray(),
    boardPlayers: newReadonlyArray(),
    turnHistory: newReadonlyArray(...(options.turnHistory ?? [])),
    flags: newReadonlyArray(),
  });

export const mkExecutedTurn = (
  options: {
    id?: string;
    playerId?: string;
    moves?: readonly Move[];
    effects?: readonly Effect[];
    intendedAt?: Date;
    resolvedAt?: Date;
    executedAt?: Date;
  } = {},
): ExecutedTurn =>
  ExecutedTurn.create({
    id: options.id ?? 'turn-1',
    playerId: options.playerId ?? 'player-1',
    moves: newReadonlyArray(...(options.moves ?? [])),
    effects: newReadonlyArray(...(options.effects ?? [])),
    intendedAt: options.intendedAt ?? new Date('2020-01-01T00:00:00Z'),
    resolvedAt: options.resolvedAt ?? new Date('2020-01-01T00:00:01Z'),
    executedAt: options.executedAt ?? new Date('2020-01-01T00:00:02Z'),
  });
