import {
  ChessPieceKind,
  Effect,
  type Effect_StateChange,
  type GameSnapshot,
  Move,
} from '@kaboom/proto';

import { IllegalMoveError, type MoveResolver } from '../base/ruleset';
import {
  getBoardById,
  getPieceAtBoardPosition,
  getPieceById,
  movesEqual,
  truePieceKind,
} from '../base/state_utils';
import { ChessDirectionVectors, SmartVector } from '../base/vector';
import { getClassicBoard } from './utils';

export const RookCaptureResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.rook?.capture !== undefined,
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
          if (occupyingPiece.color !== rook.color) {
            destinations.push(pos);
          }
          break;
        }
      }
    }

    const moves = destinations.map((dest) =>
      Move.create({
        classicMove: {
          rook: {
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
    const rookCapture = move.classicMove?.rook?.capture;
    if (!rookCapture) {
      throw new Error('Invalid move: not a Rook capture');
    }
    const board = getBoardById(snapshot, rookCapture.from?.boardId || '');
    if (rookCapture.from?.boardId === undefined || !board) {
      throw new Error(
        `Invalid move: Rook capture specified unknown board ID '${rookCapture.from?.boardId}'`,
      );
    }

    const rook = getPieceAtBoardPosition(snapshot, board.id, rookCapture.from.boardPosition!);
    if (!rook) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          rookCapture.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [rook.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const rookCapture = move.classicMove?.rook?.capture;
    if (!rookCapture) {
      throw new Error('Invalid move: not a Rook capture');
    }

    const movedPieces = RookCaptureResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: Rook capture should move exactly one piece, but movedPieces=${JSON.stringify(
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

    const validMoves = RookCaptureResolver.validMoves(snapshot, rook.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Illegal rook capture move`);
    }

    const target = getPieceAtBoardPosition(
      snapshot,
      rookCapture.to?.boardId || '',
      rookCapture.to?.boardPosition!,
    );
    if (!target) {
      throw new IllegalMoveError(
        move,
        `No piece to capture at position ${JSON.stringify(
          rookCapture.to?.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [
      Effect.create({
        stateChanges: [
          {
            pieceMoved: {
              pieceId: rook.id,
              to: rookCapture.to,
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
