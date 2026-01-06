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

export const PawnEnPassantResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.pawn?.enPassant !== undefined,
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
    const turnHistory = snapshot.turnHistory ?? [];
    const lastTurn = turnHistory[turnHistory.length - 1];
    if (!lastTurn) {
      return [];
    }

    const moves: Move[] = [];
    for (const colDelta of [-1, 1]) {
      const adjacentPos = position.add({ row: 0, column: colDelta });
      const targetPos = position.add({ row: forward.row, column: forward.column + colDelta });

      if (!targetPos.isWithinBoardBounds(board)) {
        continue;
      }

      if (getPieceAtBoardPosition(snapshot, board.id, targetPos.vector)) {
        continue;
      }

      const adjacentPiece = getPieceAtBoardPosition(snapshot, board.id, adjacentPos.vector);
      if (!adjacentPiece) {
        continue;
      }
      if (truePieceKind(adjacentPiece) !== ChessPieceKind.PAWN) {
        continue;
      }
      if (adjacentPiece.color === pawn.color) {
        continue;
      }

      const eligibleTwoStep = lastTurn.moves.some((m) => {
        const twoStep = m.classicMove?.pawn?.twoStep;
        if (!twoStep) {
          return false;
        }
        if (twoStep.to?.boardId !== board.id || twoStep.from?.boardId !== board.id) {
          return false;
        }
        if (!twoStep.to.boardPosition || !twoStep.from.boardPosition) {
          return false;
        }
        const toVec = SmartVector.of(twoStep.to.boardPosition);
        const fromVec = SmartVector.of(twoStep.from.boardPosition);
        const moveDeltaRow = Math.abs(toVec.row - fromVec.row);
        const moveDeltaCol = Math.abs(toVec.column - fromVec.column);

        return (
          toVec.equals(adjacentPos) &&
          moveDeltaRow === 2 &&
          moveDeltaCol === 0 &&
          truePieceKind(adjacentPiece) === ChessPieceKind.PAWN
        );
      });

      if (!eligibleTwoStep) {
        continue;
      }

      moves.push(
        Move.create({
          classicMove: {
            pawn: {
              enPassant: {
                from: { boardId: board.id, boardPosition: position.vector },
                to: { boardId: board.id, boardPosition: targetPos.vector },
              },
            },
          },
        }),
      );
    }

    return moves;
  },

  getMovedPieceIds: (snapshot: GameSnapshot, move: Move): string[] => {
    const enPassant = move.classicMove?.pawn?.enPassant;
    if (!enPassant) {
      throw new Error('Invalid move: not a Pawn en passant move');
    }
    if (!enPassant.from?.boardPosition) {
      throw new IllegalMoveError(move, `En passant origin missing board position`);
    }
    if (!enPassant.to?.boardPosition) {
      throw new IllegalMoveError(move, `En passant destination missing board position`);
    }
    if (enPassant.to?.boardId !== enPassant.from?.boardId) {
      throw new IllegalMoveError(move, `En passant destination board mismatch`);
    }
    const board = getBoardById(snapshot, enPassant.from?.boardId || '');
    if (!board || enPassant.from?.boardId === undefined) {
      throw new Error(
        `Invalid move: Pawn en passant specified unknown board ID '${enPassant.from?.boardId}'`,
      );
    }
    if (!enPassant.from.boardPosition) {
      throw new IllegalMoveError(move, `En passant origin missing board position`);
    }

    const pawn = getPieceAtBoardPosition(snapshot, board.id, enPassant.from.boardPosition!);
    if (!pawn) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          enPassant.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [pawn.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const enPassant = move.classicMove?.pawn?.enPassant;
    if (!enPassant) {
      throw new Error('Invalid move: not a Pawn en passant move');
    }
    const movedPieces = PawnEnPassantResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: Pawn en passant should move exactly one piece, but movedPieces=${JSON.stringify(
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

    const validMoves = PawnEnPassantResolver.validMoves(snapshot, pawn.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Illegal pawn en passant move`);
    }

    const capturePos = SmartVector.of(enPassant.from.boardPosition!).add({
      row: 0,
      column: enPassant.to.boardPosition.column - enPassant.from.boardPosition!.column,
    });

    const target = getPieceAtBoardPosition(
      snapshot,
      enPassant.from?.boardId || '',
      capturePos.vector,
    );
    if (!target) {
      throw new IllegalMoveError(
        move,
        `No pawn to capture en passant at position ${JSON.stringify(
          capturePos.vector,
        )} on board '${board.id}'`,
      );
    }
    if (target.color === pawn.color) {
      throw new IllegalMoveError(move, `Cannot capture own piece en passant`);
    }

    return [
      Effect.create({
        stateChanges: [
          {
            pieceMoved: {
              pieceId: pawn.id,
              to: enPassant.to,
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
