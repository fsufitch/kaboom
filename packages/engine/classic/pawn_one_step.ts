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
import { SmartVector } from '../base/vector';
import { getClassicBoard } from './utils';

export const PawnOneStepMoveResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.pawn?.oneStep !== undefined,
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
    const direction = SmartVector.pawnDirection(pawn.color);
    const destination = position.add(direction);

    const moves: Move[] = [];
    if (destination.isWithinBoardBounds(board)) {
      const occupyingPiece = getPieceAtBoardPosition(snapshot, board.id, destination.vector);
      if (!occupyingPiece) {
        moves.push(
          Move.create({
            classicMove: {
              pawn: {
                oneStep: {
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
    const pawnMove = move.classicMove?.pawn?.oneStep;
    if (!pawnMove) {
      throw new Error('Invalid move: not a Pawn one-step move');
    }
    const board = getBoardById(snapshot, pawnMove.from?.boardId || '');
    if (!board || pawnMove.from?.boardId === undefined) {
      throw new Error(
        `Invalid move: Pawn move specified unknown board ID '${pawnMove.from?.boardId}'`,
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
    const pawnMove = move.classicMove?.pawn?.oneStep;
    if (!pawnMove) {
      throw new Error('Invalid move: not a Pawn one-step move');
    }

    const movedPieces = PawnOneStepMoveResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: Pawn one-step should move exactly one piece, but movedPieces=${JSON.stringify(
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

    const validMoves = PawnOneStepMoveResolver.validMoves(snapshot, pawn.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Not a legal pawn one-step move`);
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
        ] as readonly Effect_StateChange[],
      }),
    ];
  },
};
