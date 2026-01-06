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

export const BishopCaptureResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.bishop?.capture !== undefined,
  validMoves: (snapshot: GameSnapshot, pieceId: string): Move[] => {
    const bishop = getPieceById(snapshot, pieceId);
    if (!bishop) {
      throw new Error(`Piece with ID '${pieceId}' does not exist`);
    }
    if (truePieceKind(bishop) !== ChessPieceKind.BISHOP) {
      throw new Error(`Piece with ID '${pieceId}' is not a Bishop`);
    }
    if (!bishop.place?.boardPosition) {
      throw new Error(`Piece with ID '${pieceId}' is not on a board`);
    }

    const board = getClassicBoard(snapshot);
    const position = SmartVector.of(bishop.place.boardPosition);
    const directions = [
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
          if (occupyingPiece.color !== bishop.color) {
            destinations.push(pos); // Can capture opponent piece
          }
          break;
        }
      }
    }

    const moves = destinations.map((dest) =>
      Move.create({
        classicMove: {
          bishop: {
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
    const bishopCapture = move.classicMove?.bishop?.capture;
    if (!bishopCapture) {
      throw new Error('Invalid move: not a Bishop capture');
    }
    const board = getBoardById(snapshot, bishopCapture.from?.boardId || '');
    if (bishopCapture.from?.boardId === undefined || !board) {
      throw new Error(
        `Invalid move: Bishop capture specified unknown board ID '${bishopCapture.from?.boardId}'`,
      );
    }

    const bishop = getPieceAtBoardPosition(snapshot, board.id, bishopCapture.from.boardPosition!);
    if (!bishop) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          bishopCapture.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [bishop.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const bishopCapture = move.classicMove?.bishop?.capture;
    if (!bishopCapture) {
      throw new Error('Invalid move: not a Bishop capture');
    }

    const movedPieces = BishopCaptureResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: Bishop capture should move exactly one piece, but movedPieces=${JSON.stringify(
          movedPieces,
        )}`,
      );
    }
    const bishop = getPieceById(snapshot, movedPieces[0]);
    if (!bishop) {
      throw new Error(`Invalid move: could not find bishop piece with ID '${movedPieces[0]}'`);
    }

    const validMoves = BishopCaptureResolver.validMoves(snapshot, bishop.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Illegal bishop capture move`);
    }

    const target = getPieceAtBoardPosition(
      snapshot,
      bishopCapture.to?.boardId || '',
      bishopCapture.to?.boardPosition!,
    );
    if (!target) {
      throw new IllegalMoveError(
        move,
        `No piece to capture at position ${JSON.stringify(
          bishopCapture.to?.boardPosition,
        )} on board '${bishopCapture.to?.boardId}'`,
      );
    }

    return [
      Effect.create({
        stateChanges: [
          {
            pieceMoved: {
              pieceId: bishop.id,
              to: bishopCapture.to,
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
