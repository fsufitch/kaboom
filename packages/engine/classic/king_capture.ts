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

export const KingCaptureResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.king?.capture !== undefined,
  validMoves: (snapshot: GameSnapshot, pieceId: string): Move[] => {
    const king = getPieceById(snapshot, pieceId);
    if (!king) {
      throw new Error(`Piece with ID '${pieceId}' does not exist`);
    }
    if (truePieceKind(king) !== ChessPieceKind.KING) {
      throw new Error(`Piece with ID '${pieceId}' is not a King`);
    }
    if (!king.place?.boardPosition) {
      throw new Error(`Piece with ID '${pieceId}' is not on a board`);
    }

    const board = getClassicBoard(snapshot);
    const position = SmartVector.of(king.place.boardPosition);
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
      const pos = position.add(direction);
      if (!pos.isWithinBoardBounds(board)) {
        continue;
      }
      const occupyingPiece = getPieceAtBoardPosition(snapshot, board.id, pos.vector);
      if (!occupyingPiece) {
        continue;
      }
      if (occupyingPiece.color !== king.color) {
        destinations.push(pos);
      }
    }

    const moves = destinations.map((dest) =>
      Move.create({
        classicMove: {
          king: {
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
    const kingCapture = move.classicMove?.king?.capture;
    if (!kingCapture) {
      throw new Error('Invalid move: not a King capture');
    }
    const board = getBoardById(snapshot, kingCapture.from?.boardId || '');
    if (kingCapture.from?.boardId === undefined || !board) {
      throw new Error(
        `Invalid move: King capture specified unknown board ID '${kingCapture.from?.boardId}'`,
      );
    }

    const king = getPieceAtBoardPosition(snapshot, board.id, kingCapture.from.boardPosition!);
    if (!king) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          kingCapture.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [king.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const kingCapture = move.classicMove?.king?.capture;
    if (!kingCapture) {
      throw new Error('Invalid move: not a King capture');
    }

    const movedPieces = KingCaptureResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: King capture should move exactly one piece, but movedPieces=${JSON.stringify(
          movedPieces,
        )}`,
      );
    }
    const king = getPieceById(snapshot, movedPieces[0]);
    if (!king) {
      throw new Error(
        `Invalid move: could not find king piece with ID '${movedPieces[0]}'`,
      );
    }

    const validMoves = KingCaptureResolver.validMoves(snapshot, king.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Illegal king capture move`);
    }

    const target = getPieceAtBoardPosition(
      snapshot,
      kingCapture.to?.boardId || '',
      kingCapture.to?.boardPosition!,
    );
    if (!target) {
      throw new IllegalMoveError(
        move,
        `No piece to capture at position ${JSON.stringify(
          kingCapture.to?.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [
      Effect.create({
        stateChanges: [
          {
            pieceMoved: {
              pieceId: king.id,
              to: kingCapture.to,
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
