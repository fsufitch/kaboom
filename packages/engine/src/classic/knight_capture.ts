import { IllegalMoveError, type MoveResolver, newReadonlyArray } from '@kaboom/engine/base';
import {
  KnightDirectionVectors,
  SmartVector,
  getBoardById,
  getPieceAtBoardPosition,
  getPieceById,
  movesEqual,
  truePieceKind,
} from '@kaboom/engine/base';
import { ChessPieceKind, Effect, type GameSnapshot, Move } from '@kaboom/proto';

import { getClassicBoard } from './utils';

export const KnightCaptureResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.knight?.capture !== undefined,
  validMoves: (snapshot: GameSnapshot, pieceId: string): Move[] => {
    const knight = getPieceById(snapshot, pieceId);
    if (!knight) {
      throw new Error(`Piece with ID '${pieceId}' does not exist`);
    }
    if (truePieceKind(knight) !== ChessPieceKind.KNIGHT) {
      throw new Error(`Piece with ID '${pieceId}' is not a Knight`);
    }
    if (!knight.place?.boardPosition) {
      throw new Error(`Piece with ID '${pieceId}' is not on a board`);
    }

    const board = getClassicBoard(snapshot);
    const position = SmartVector.of(knight.place.boardPosition);

    const destinations: SmartVector[] = [];
    for (const direction of KnightDirectionVectors) {
      const pos = position.add(direction);
      if (!pos.isWithinBoardBounds(board)) {
        continue;
      }
      const occupyingPiece = getPieceAtBoardPosition(snapshot, board.id, pos.vector);
      if (!occupyingPiece) {
        continue;
      }
      if (occupyingPiece.color !== knight.color) {
        destinations.push(pos);
      }
    }

    const moves = destinations.map((dest) =>
      Move.create({
        classicMove: {
          knight: {
            capture: {
              from: { boardId: board.id, boardPosition: position.vector },
              to: { boardId: board.id, boardPosition: dest.vector },
            },
          },
        },
      }),
    );

    return moves;
  },

  getMovedPieceIds: (snapshot: GameSnapshot, move: Move): string[] => {
    const knightCapture = move.classicMove?.knight?.capture;
    if (!knightCapture) {
      throw new Error('Invalid move: not a Knight capture');
    }
    const board = getBoardById(snapshot, knightCapture.from?.boardId || '');
    if (knightCapture.from?.boardId === undefined || !board) {
      throw new Error(
        `Invalid move: Knight capture specified unknown board ID '${knightCapture.from?.boardId}'`,
      );
    }

    const knight = getPieceAtBoardPosition(snapshot, board.id, knightCapture.from.boardPosition!);
    if (!knight) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          knightCapture.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [knight.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const knightCapture = move.classicMove?.knight?.capture;
    if (!knightCapture) {
      throw new Error('Invalid move: not a Knight capture');
    }

    const movedPieces = KnightCaptureResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: Knight capture should move exactly one piece, but movedPieces=${JSON.stringify(
          movedPieces,
        )}`,
      );
    }
    const knight = getPieceById(snapshot, movedPieces[0]);
    if (!knight) {
      throw new Error(`Invalid move: could not find knight piece with ID '${movedPieces[0]}'`);
    }

    const validMoves = KnightCaptureResolver.validMoves(snapshot, knight.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Illegal knight capture move`);
    }

    const target = getPieceAtBoardPosition(
      snapshot,
      knightCapture.to?.boardId || '',
      knightCapture.to?.boardPosition!,
    );
    if (!target) {
      throw new IllegalMoveError(
        move,
        `No piece to capture at position ${JSON.stringify(
          knightCapture.to?.boardPosition,
        )} on board '${knightCapture.to?.boardId}'`,
      );
    }

    return [
      Effect.create({
        stateChanges: newReadonlyArray(
          {
            pieceMoved: {
              pieceId: knight.id,
              to: knightCapture.to?.boardPosition,
            },
          },
          {
            pieceCaptured: {
              pieceId: target.id,
            },
          },
        ),
      }),
    ];
  },
};
