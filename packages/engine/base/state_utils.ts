import {
  type ChessPiece,
  ChessPieceKind,
  type GameSnapshot,
  Move,
  type Vector,
} from '@kaboom/proto';

import type { GameSnapshotWritable } from './types';

export const getFlagById = (gs: GameSnapshot | GameSnapshotWritable, flagId: string) =>
  gs.flags.find((f) => f.id === flagId);

export const getPieceById = (gs: GameSnapshot | GameSnapshotWritable, pieceId: string) =>
  gs.pieces.find((p) => p.id === pieceId);

export const getBoardById = (gs: GameSnapshot | GameSnapshotWritable, boardId: string) =>
  gs.boards.find((b) => b.id === boardId);

export const getSingleBoard = (gs: GameSnapshot | GameSnapshotWritable) => {
  if (gs.boards.length !== 1) {
    throw new Error('Expected exactly one board in the game snapshot');
  }
  return gs.boards[0];
};

export const getPieceAtBoardPosition = (
  gs: GameSnapshot | GameSnapshotWritable,
  boardId: string,
  vector: Vector,
) =>
  gs.pieces.find((p) => {
    if (p.place?.benched || p.place?.captured) {
      return false;
    }
    return p.place?.boardId === boardId && p.place?.boardPosition === vector;
  });

export const truePieceKind = (piece: ChessPiece): ChessPieceKind => {
  // In case of promotion, return the promoted kind
  if (
    piece.promotedKind &&
    piece.promotedKind !== ChessPieceKind.KIND_UNKNOWN &&
    piece.promotedKind !== ChessPieceKind.UNRECOGNIZED
  ) {
    return piece.promotedKind;
  }
  return piece.kind;
};

export const movesEqual = (moveA: Move, moveB: Move): boolean => {
  const encodedMoveA = Move.encode(moveA).finish();
  const encodedMoveB = Move.encode(moveB).finish();
  return Buffer.compare(encodedMoveA, encodedMoveB) === 0;
};
