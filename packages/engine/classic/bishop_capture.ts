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

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
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

    const validMoves = BishopCaptureResolver.validMoves(snapshot, bishop.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Illegal bishop capture move`);
    }

    const target = getPieceAtBoardPosition(snapshot, board.id, bishopMove.to?.boardPosition!);
    if (!target) {
      throw new IllegalMoveError(
        move,
        `No piece to capture at position ${JSON.stringify(
          bishopMove.to?.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [
      Effect.create({
        stateChanges: [
          {
            pieceMoved: {
              pieceId: bishop.id,
              to: bishopMove.to,
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
