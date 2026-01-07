import { describe, expect, it } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { PawnOneStepMoveResolver } from '@kaboom/engine/classic/pawn_one_step';
import { ChessColor, ChessPieceKind, Move } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkPawnOneStepMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      pawn: {
        oneStep: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('PawnOneStepMoveResolver (classic)', () => {
  it('enumerates one-step moves when the forward square is empty', () => {
    const whitePawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 3 });
    const blackPawn = mkPiece({ id: 'bp', color: ChessColor.BLACK, row: 6, column: 4 });
    const gs = mkSnapshot({ pieces: [whitePawn, blackPawn] });

    const whiteMoves = PawnOneStepMoveResolver.validMoves(gs, whitePawn.id);
    const blackMoves = PawnOneStepMoveResolver.validMoves(gs, blackPawn.id);

    expect(whiteMoves).toHaveLength(1);
    expect(blackMoves).toHaveLength(1);
    const [whiteMove] = whiteMoves;
    const [blackMove] = blackMoves;
    if (!whiteMove || !blackMove) {
      throw new Error('Expected pawn one-step moves to be present');
    }
    expect(movesEqual(whiteMove, mkPawnOneStepMove(1, 3, 2, 3))).toBe(true);
    expect(movesEqual(blackMove, mkPawnOneStepMove(6, 4, 5, 4))).toBe(true);
  });

  it('returns no moves when the forward square is blocked', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 3 });
    const blocker = mkPiece({
      id: 'block',
      kind: ChessPieceKind.KNIGHT,
      color: ChessColor.BLACK,
      row: 2,
      column: 3,
    });
    const gs = mkSnapshot({ pieces: [pawn, blocker] });

    const moves = PawnOneStepMoveResolver.validMoves(gs, pawn.id);

    expect(moves).toHaveLength(0);
  });

  it('resolves a legal one-step move into a pieceMoved state change', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 3 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const move = mkPawnOneStepMove(1, 3, 2, 3);

    const effects = PawnOneStepMoveResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(1);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(pawn.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 2, column: 3 });
  });

  it('throws IllegalMoveError for an illegal one-step move', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 3 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const illegal = mkPawnOneStepMove(1, 3, 3, 3);

    expect(() => PawnOneStepMoveResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });
});
