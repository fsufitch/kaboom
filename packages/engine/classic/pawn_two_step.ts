import {
  ChessColor,
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
import { getClassicBoard, pieceMovedThisGame } from './utils';

export const PawnTwoStepMoveResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.pawn?.twoStep !== undefined,
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

    if (pieceMovedThisGame(snapshot, pawn.id)) {
      return [];
    }

    const board = getClassicBoard(snapshot);
    const position = SmartVector.of(pawn.place.boardPosition);
    const direction = SmartVector.pawnDirection(pawn.color);

    // white starts at row 1, black at row (rows - 2)
    const homeRow = pawn.color === ChessColor.WHITE ? 1 : board.rows - 2;
    if (position.row !== homeRow) {
      return [];
    }

    const oneStep = position.add(direction);
    const twoStep = oneStep.add(direction);

    if (!twoStep.isWithinBoardBounds(board)) {
      return [];
    }

    if (getPieceAtBoardPosition(snapshot, board.id, oneStep.vector)) {
      return [];
    }
    if (getPieceAtBoardPosition(snapshot, board.id, twoStep.vector)) {
      return [];
    }

    return [
      Move.create({
        classicMove: {
          pawn: {
            twoStep: {
              from: { boardId: board.id, boardPosition: position.vector },
              to: { boardId: board.id, boardPosition: twoStep.vector },
            },
          },
        },
      }),
    ];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const pawnMove = move.classicMove?.pawn?.twoStep;
    if (!pawnMove) {
      throw new Error('Invalid move: not a Pawn two-step move');
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
    if (truePieceKind(pawn) !== ChessPieceKind.PAWN) {
      throw new Error(`Invalid move: piece at origin is not a Pawn`);
    }

    const validMoves = PawnTwoStepMoveResolver.validMoves(snapshot, pawn.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Not a legal pawn two-step move`);
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
