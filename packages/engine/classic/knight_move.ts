import {
  ChessPieceKind,
  Effect,
  type Effect_StateChange,
  type GameSnapshot,
  Move,
} from '@kaboom/proto';

import { IllegalMoveError, type MoveResolver } from '@kaboom/engine/base';
import {
  getBoardById,
  getPieceAtBoardPosition,
  getPieceById,
  movesEqual,
  truePieceKind,
} from '@kaboom/engine/base';
import { KnightDirectionVectors, SmartVector } from '@kaboom/engine/base';
import { getClassicBoard } from './utils';

export const KnightMoveResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.knight?.move !== undefined,
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
      if (occupyingPiece) {
        continue;
      }
      destinations.push(pos);
    }

    const moves = destinations.map((dest) =>
      Move.create({
        classicMove: {
          knight: {
            move: {
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
    const knightMove = move.classicMove?.knight?.move;
    if (!knightMove) {
      throw new Error('Invalid move: not a Knight move');
    }
    const board = getBoardById(snapshot, knightMove.from?.boardId || '');
    if (knightMove.from?.boardId === undefined || !board) {
      throw new Error(
        `Invalid move: Knight move specified unknown board ID '${knightMove.from?.boardId}'`,
      );
    }

    const knight = getPieceAtBoardPosition(snapshot, board.id, knightMove.from.boardPosition!);
    if (!knight) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          knightMove.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [knight.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const knightMove = move.classicMove?.knight?.move;
    if (!knightMove) {
      throw new Error('Invalid move: not a Knight move');
    }

    const movedPieces = KnightMoveResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: Knight move should move exactly one piece, but movedPieces=${JSON.stringify(
          movedPieces,
        )}`,
      );
    }
    const knight = getPieceById(snapshot, movedPieces[0]);
    if (!knight) {
      throw new Error(
        `Invalid move: could not find knight piece with ID '${movedPieces[0]}'`,
      );
    }

    const validMoves = KnightMoveResolver.validMoves(snapshot, knight.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Not a legal knight move`);
    }

    return [
      Effect.create({
        stateChanges: [
          {
            pieceMoved: {
              pieceId: knight.id,
              to: knightMove.to,
            },
          },
        ] as readonly Effect_StateChange[],
      }),
    ];
  },
};
