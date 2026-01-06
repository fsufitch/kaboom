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
import { SmartVector } from '@kaboom/engine/base';
import { getClassicBoard } from './utils';

export const PawnCaptureResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.pawn?.capture !== undefined,
  validMoves: (snapshot: GameSnapshot, pieceId: string): Move[] => {
    const pawn = getPieceById(snapshot, pieceId);
    if (!pawn) {
      throw new Error(`Piece with ID '${pieceId}' does not exist`);
    }
    if (truePieceKind(pawn) !== ChessPieceKind.PAWN) {
      throw new Error(`Piece with ID '${pieceId}' is not a Pawn`);
    }
    if (!pawn.place?.boardPosition) {
      throw new Error(`Piece with ID '${pieceId}' is not on a board`);
    }

    const board = getClassicBoard(snapshot);
    const position = SmartVector.of(pawn.place.boardPosition);
    const forward = SmartVector.pawnDirection(pawn.color);
    const columns = [-1, 1];

    const moves: Move[] = [];
    for (const colDelta of columns) {
      const destination = position.add({ row: forward.row, column: forward.column + colDelta });
      if (!destination.isWithinBoardBounds(board)) {
        continue;
      }
      const occupyingPiece = getPieceAtBoardPosition(snapshot, board.id, destination.vector);
      if (occupyingPiece && occupyingPiece.color !== pawn.color) {
        moves.push(
          Move.create({
            classicMove: {
              pawn: {
                capture: {
                  from: { boardId: board.id, boardPosition: position.vector },
                  to: { boardId: board.id, boardPosition: destination.vector },
                },
              },
            },
          }),
        );
      }
    }

    return moves;
  },

  getMovedPieceIds: (snapshot: GameSnapshot, move: Move): string[] => {
    const pawnMove = move.classicMove?.pawn?.capture;
    if (!pawnMove) {
      throw new Error('Invalid move: not a Pawn capture move');
    }
    const board = getBoardById(snapshot, pawnMove.from?.boardId || '');
    if (!board || pawnMove.from?.boardId === undefined) {
      throw new Error(
        `Invalid move: Pawn capture specified unknown board ID '${pawnMove.from?.boardId}'`,
      );
    }

    const pawn = getPieceAtBoardPosition(snapshot, board.id, pawnMove.from.boardPosition!);
    if (!pawn) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          pawnMove.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [pawn.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const pawnMove = move.classicMove?.pawn?.capture;
    if (!pawnMove) {
      throw new Error('Invalid move: not a Pawn capture move');
    }

    const movedPieces = PawnCaptureResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: Pawn capture should move exactly one piece, but movedPieces=${JSON.stringify(
          movedPieces,
        )}`,
      );
    }
    const pawn = getPieceById(snapshot, movedPieces[0]);
    if (!pawn) {
      throw new Error(
        `Invalid move: could not find pawn piece with ID '${movedPieces[0]}'`,
      );
    }
    if (truePieceKind(pawn) !== ChessPieceKind.PAWN) {
      throw new Error(`Invalid move: piece at origin is not a Pawn`);
    }

    const validMoves = PawnCaptureResolver.validMoves(snapshot, pawn.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Illegal pawn capture move`);
    }

    const target = getPieceAtBoardPosition(
      snapshot,
      pawnMove.to?.boardId || '',
      pawnMove.to?.boardPosition!,
    );
    if (!target) {
      throw new IllegalMoveError(
        move,
        `No piece to capture at position ${JSON.stringify(
          pawnMove.to?.boardPosition,
        )} on board '${board.id}'`,
      );
    }
    if (target.color === pawn.color) {
      throw new IllegalMoveError(move, `Cannot capture own piece`);
    }

    return [
      Effect.create({
        stateChanges: [
          {
            pieceMoved: {
              pieceId: pawn.id,
              to: pawnMove.to,
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
