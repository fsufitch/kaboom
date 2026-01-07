import {
  ChessPieceKind,
  Effect,
  type GameSnapshot,
  Move,
} from '@kaboom/proto';

import { IllegalMoveError, type MoveResolver, newReadonlyArray } from '@kaboom/engine/base';
import {
  getBoardById,
  getPieceAtBoardPosition,
  getPieceById,
  movesEqual,
  truePieceKind,
 ChessDirectionVectors, SmartVector } from '@kaboom/engine/base';
import { getClassicBoard } from './utils';

export const QueenMoveResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.queen?.move !== undefined,
  validMoves: (snapshot: GameSnapshot, pieceId: string): Move[] => {
    const queen = getPieceById(snapshot, pieceId);
    if (!queen) {
      throw new Error(`Piece with ID '${pieceId}' does not exist`);
    }
    if (truePieceKind(queen) !== ChessPieceKind.QUEEN) {
      throw new Error(`Piece with ID '${pieceId}' is not a Queen`);
    }
    if (!queen.place?.boardPosition) {
      throw new Error(`Piece with ID '${pieceId}' is not on a board`);
    }

    const board = getClassicBoard(snapshot);
    const position = SmartVector.of(queen.place.boardPosition);
    const directions = [
      ChessDirectionVectors.NORTH,
      ChessDirectionVectors.SOUTH,
      ChessDirectionVectors.EAST,
      ChessDirectionVectors.WEST,
      ChessDirectionVectors.NORTHEAST,
      ChessDirectionVectors.NORTHWEST,
      ChessDirectionVectors.SOUTHEAST,
      ChessDirectionVectors.SOUTHWEST,
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
          queen: {
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
    const queenMove = move.classicMove?.queen?.move;
    if (!queenMove) {
      throw new Error('Invalid move: not a Queen move');
    }
    const board = getBoardById(snapshot, queenMove.from?.boardId || '');
    if (queenMove.from?.boardId === undefined || !board) {
      throw new Error(
        `Invalid move: Queen move specified unknown board ID '${queenMove.from?.boardId}'`,
      );
    }

    const queen = getPieceAtBoardPosition(snapshot, board.id, queenMove.from.boardPosition!);
    if (!queen) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          queenMove.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [queen.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const queenMove = move.classicMove?.queen?.move;
    if (!queenMove) {
      throw new Error('Invalid move: not a Queen move');
    }

    const movedPieces = QueenMoveResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: Queen move should move exactly one piece, but movedPieces=${JSON.stringify(
          movedPieces,
        )}`,
      );
    }
    const queen = getPieceById(snapshot, movedPieces[0]);
    if (!queen) {
      throw new Error(
        `Invalid move: could not find queen piece with ID '${movedPieces[0]}'`,
      );
    }

    const validMoves = QueenMoveResolver.validMoves(snapshot, queen.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Not a legal queen move`);
    }

    return [
      Effect.create({
        stateChanges: newReadonlyArray({
          pieceMoved: {
            pieceId: queen.id,
            to: queenMove.to?.boardPosition,
          },
        }),
      }),
    ];
  },
};
