import { IllegalMoveError, type MoveResolver } from '@kaboom/engine/base';
import {
  ChessDirectionVectors,
  SmartVector,
  getBoardById,
  getPieceAtBoardPosition,
  getPieceById,
  movesEqual,
  truePieceKind,
} from '@kaboom/engine/base';
import {
  ChessPieceKind,
  Effect,
  type Effect_StateChange,
  type GameSnapshot,
  Move,
} from '@kaboom/proto';

import { getClassicBoard } from './utils';

export const QueenCaptureResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.queen?.capture !== undefined,
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
          if (occupyingPiece.color !== queen.color) {
            destinations.push(pos);
          }
          break;
        }
      }
    }

    const moves = destinations.map((dest) =>
      Move.create({
        classicMove: {
          queen: {
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
    const queenCapture = move.classicMove?.queen?.capture;
    if (!queenCapture) {
      throw new Error('Invalid move: not a Queen capture');
    }
    const board = getBoardById(snapshot, queenCapture.from?.boardId || '');
    if (queenCapture.from?.boardId === undefined || !board) {
      throw new Error(
        `Invalid move: Queen capture specified unknown board ID '${queenCapture.from?.boardId}'`,
      );
    }

    const queen = getPieceAtBoardPosition(snapshot, board.id, queenCapture.from.boardPosition!);
    if (!queen) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          queenCapture.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [queen.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const queenCapture = move.classicMove?.queen?.capture;
    if (!queenCapture) {
      throw new Error('Invalid move: not a Queen capture');
    }

    const movedPieces = QueenCaptureResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: Queen capture should move exactly one piece, but movedPieces=${JSON.stringify(
          movedPieces,
        )}`,
      );
    }
    const queen = getPieceById(snapshot, movedPieces[0]);
    if (!queen) {
      throw new Error(`Invalid move: could not find queen piece with ID '${movedPieces[0]}'`);
    }

    const validMoves = QueenCaptureResolver.validMoves(snapshot, queen.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Illegal queen capture move`);
    }

    const target = getPieceAtBoardPosition(
      snapshot,
      queenCapture.to?.boardId || '',
      queenCapture.to?.boardPosition!,
    );
    if (!target) {
      throw new IllegalMoveError(
        move,
        `No piece to capture at position ${JSON.stringify(
          queenCapture.to?.boardPosition,
        )} on board '${queenCapture.to?.boardId}'`,
      );
    }

    return [
      Effect.create({
        stateChanges: [
          {
            pieceMoved: {
              pieceId: queen.id,
              to: queenCapture.to,
            },
          },
          {
            pieceCaptured: {
              pieceId: target.id,
            },
          },
        ] as readonly Effect_StateChange[],
      }),
    ];
  },
};
