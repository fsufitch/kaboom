import { IllegalMoveError, type MoveResolver, newReadonlyArray } from '@kaboom/engine/base';
import {
  ChessDirectionVectors,
  SmartVector,
  getBoardById,
  getPieceAtBoardPosition,
  getPieceById,
  movesEqual,
  truePieceKind,
} from '@kaboom/engine/base';
import { ChessPieceKind, Effect, type GameSnapshot, Move } from '@kaboom/proto';

import { getClassicBoard } from './utils';

export const BishopMoveResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.bishop?.move !== undefined,
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
          break; // Can't jump over pieces
        }
        destinations.push(pos);
      }
    }

    const moves = destinations.map((dest) =>
      Move.create({
        classicMove: {
          bishop: {
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
    const bishopMove = move.classicMove?.bishop?.move;
    if (!bishopMove) {
      throw new Error('Invalid move: not a Bishop move');
    }
    const board = getBoardById(snapshot, bishopMove.from?.boardId || '');
    if (bishopMove.from?.boardId === undefined || !board) {
      throw new Error(
        `Invalid move: Bishop move specified unknown board ID '${bishopMove.from?.boardId}'`,
      );
    }

    const bishop = getPieceAtBoardPosition(snapshot, board.id, bishopMove.from.boardPosition!);
    if (!bishop) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          bishopMove.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [bishop.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const bishopMove = move.classicMove?.bishop?.move;
    if (!bishopMove) {
      throw new Error('Invalid move: not a Bishop move');
    }

    const movedPieces = BishopMoveResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: Bishop move should move exactly one piece, but movedPieces=${JSON.stringify(
          movedPieces,
        )}`,
      );
    }
    const bishop = getPieceById(snapshot, movedPieces[0]);
    if (!bishop) {
      throw new Error(`Invalid move: could not find bishop piece with ID '${movedPieces[0]}'`);
    }

    const validMoves = BishopMoveResolver.validMoves(snapshot, bishop.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Not a legal bishop move`);
    }

    return [
      Effect.create({
        stateChanges: newReadonlyArray({
          pieceMoved: {
            pieceId: bishop.id,
            to: bishopMove.to?.boardPosition,
          },
        }),
      }),
    ];
  },
};
