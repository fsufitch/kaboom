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

export const KingMoveResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.king?.move !== undefined,
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
      if (occupyingPiece) {
        continue;
      }
      destinations.push(pos);
    }

    const moves = destinations.map((dest) =>
      Move.create({
        classicMove: {
          king: {
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
    const kingMove = move.classicMove?.king?.move;
    if (!kingMove) {
      throw new Error('Invalid move: not a King move');
    }
    const board = getBoardById(snapshot, kingMove.from?.boardId || '');
    if (kingMove.from?.boardId === undefined || !board) {
      throw new Error(
        `Invalid move: King move specified unknown board ID '${kingMove.from?.boardId}'`,
      );
    }

    const king = getPieceAtBoardPosition(snapshot, board.id, kingMove.from.boardPosition!);
    if (!king) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          kingMove.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [king.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const kingMove = move.classicMove?.king?.move;
    if (!kingMove) {
      throw new Error('Invalid move: not a King move');
    }

    const movedPieces = KingMoveResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: King move should move exactly one piece, but movedPieces=${JSON.stringify(
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

    const validMoves = KingMoveResolver.validMoves(snapshot, king.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Not a legal king move`);
    }

    return [
      Effect.create({
        stateChanges: [
          {
            pieceMoved: {
              pieceId: king.id,
              to: kingMove.to,
            },
          },
        ] as readonly Effect_StateChange[],
      }),
    ];
  },
};
