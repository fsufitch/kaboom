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
import { getClassicBoard } from './utils';

const PROMOTION_OPTIONS: ChessPieceKind[] = [
  ChessPieceKind.QUEEN,
  ChessPieceKind.ROOK,
  ChessPieceKind.BISHOP,
  ChessPieceKind.KNIGHT,
];

export const PawnPromotionResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.pawn?.promotion !== undefined,
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
    const isFinalRank =
      (pawn.color === ChessColor.WHITE && position.row === board.rows - 1) ||
      (pawn.color === ChessColor.BLACK && position.row === 0);

    if (!isFinalRank) {
      return [];
    }

    return PROMOTION_OPTIONS.map((promoteTo) =>
      Move.create({
        classicMove: {
          pawn: {
            promotion: {
              from: { boardId: board.id, boardPosition: position.vector },
              promoteTo,
            },
          },
        },
      }),
    );
  },

  getMovedPieceIds: (snapshot: GameSnapshot, move: Move): string[] => {
    const promotion = move.classicMove?.pawn?.promotion;
    if (!promotion) {
      throw new Error('Invalid move: not a Pawn promotion');
    }
    const board = getBoardById(snapshot, promotion.from?.boardId || '');
    if (!board || promotion.from?.boardId === undefined) {
      throw new Error(
        `Invalid move: Pawn promotion specified unknown board ID '${promotion.from?.boardId}'`,
      );
    }
    if (!promotion.from.boardPosition) {
      throw new IllegalMoveError(move, `Pawn promotion missing origin board position`);
    }

    const pawn = getPieceAtBoardPosition(snapshot, board.id, promotion.from.boardPosition!);
    if (!pawn) {
      throw new Error(
        `Invalid move: no piece at position ${JSON.stringify(
          promotion.from.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    return [pawn.id];
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const promotion = move.classicMove?.pawn?.promotion;
    if (!promotion) {
      throw new Error('Invalid move: not a Pawn promotion');
    }
    const movedPieces = PawnPromotionResolver.getMovedPieceIds(snapshot, move);
    if (movedPieces.length !== 1 || !movedPieces[0]) {
      throw new Error(
        `Invalid move: Pawn promotion should move exactly one piece, but movedPieces=${JSON.stringify(
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

    const validMoves = PawnPromotionResolver.validMoves(snapshot, pawn.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Illegal pawn promotion move`);
    }

    return [
      Effect.create({
        stateChanges: [
          {
            piecePromoted: {
              pieceId: pawn.id,
              newKind: promotion.promoteTo,
            },
          },
        ] as readonly Effect_StateChange[],
      }),
    ];
  },
};
