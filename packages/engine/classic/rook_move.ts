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
import { ChessDirectionVectors, SmartVector } from '@kaboom/engine/base';
import { getClassicBoard } from './utils';

export const RookMoveResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.rook?.move !== undefined,
  validMoves: (snapshot: GameSnapshot, pieceId: string): Move[] => {
    const rook = getPieceById(snapshot, pieceId);
    if (!rook) {
      throw new Error(`Piece with ID '${pieceId}' does not exist`);
    }
    if (truePieceKind(rook) !== ChessPieceKind.ROOK) {
      throw new Error(`Piece with ID '${pieceId}' is not a Rook`);
    }
    if (!rook.place?.boardPosition) {
      throw new Error(`Piece with ID '${pieceId}' is not on a board`);
    }

    const board = getClassicBoard(snapshot);
    const position = SmartVector.of(rook.place.boardPosition);
    const directions = [
      ChessDirectionVectors.NORTH,
      ChessDirectionVectors.SOUTH,
      ChessDirectionVectors.EAST,
      ChessDirectionVectors.WEST,
    ];

    const destinations: SmartVector[] = [];
    for (const direction of directions) {
      for (
        let pos = position.add(direction);
        pos.isWithinBoardBounds(board);
        pos = pos.add(direction)
      ) {
        const occupyingPiece = getPieceAtBoardPosition(snapshot, board.id, pos.vector);
        if (occupyingPiece) {
          break;
        }
        destinations.push(pos);
      }
    }

    const moves = destinations.map((dest) =>
      Move.create({
        classicMove: {
          rook: {
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
    const rookMove = move.classicMove?.rook?.move;
    if (!rookMove) {
      throw new Error('Invalid move: not a Rook move');
    }
    const board = getBoardById(snapshot, rookMove.from?.boardId || '');
    if (rookMove.from?.boardId === undefined || !board) {
      throw new Error(
        `Invalid move: Rook move specified unknown board ID '${rookMove.from?.boardId}'`,
      );
    }

    const rook = getPieceAtBoardPosition(snapshot, board.id, rookMove.from.boardPosition!);
    if (!rook) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          rookMove.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [rook.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const rookMove = move.classicMove?.rook?.move;
    if (!rookMove) {
      throw new Error('Invalid move: not a Rook move');
    }

    const movedPieces = RookMoveResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: Rook move should move exactly one piece, but movedPieces=${JSON.stringify(
          movedPieces,
        )}`,
      );
    }
    const rook = getPieceById(snapshot, movedPieces[0]);
    if (!rook) {
      throw new Error(
        `Invalid move: could not find rook piece with ID '${movedPieces[0]}'`,
      );
    }

    const validMoves = RookMoveResolver.validMoves(snapshot, rook.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Not a legal rook move`);
    }

    return [
      Effect.create({
        stateChanges: [
          {
            pieceMoved: {
              pieceId: rook.id,
              to: rookMove.to,
            },
          },
        ] as readonly Effect_StateChange[],
      }),
    ];
  },
};
