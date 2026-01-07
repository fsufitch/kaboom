import { describe, expect, it } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { PawnEnPassantResolver } from '@kaboom/engine/classic/pawn_en_passant';
import { ChessColor, ChessPieceKind, Move } from '@kaboom/proto';

import { BOARD_ID, mkExecutedTurn, mkPiece, mkSnapshot } from './helpers';

const mkPawnTwoStepMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      pawn: {
        twoStep: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

const mkPawnEnPassantMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): Move =>
  Move.create({
    classicMove: {
      pawn: {
        enPassant: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('PawnEnPassantResolver (classic)', () => {
  it('enumerates en passant when the last move was an adjacent pawn two-step', () => {
    const whitePawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 4 });
    const blackPawn = mkPiece({ id: 'bp', color: ChessColor.BLACK, row: 4, column: 5 });
    const lastMove = mkPawnTwoStepMove(6, 5, 4, 5);
    const lastTurn = mkExecutedTurn({ moves: [lastMove] });

    const gs = mkSnapshot({ pieces: [whitePawn, blackPawn], turnHistory: [lastTurn] });

    const moves = PawnEnPassantResolver.validMoves(gs, whitePawn.id);

    expect(moves).toHaveLength(1);
    const [move] = moves;
    if (!move) {
      throw new Error('Expected en passant move to be present');
    }
    expect(movesEqual(move, mkPawnEnPassantMove(4, 4, 5, 5))).toBe(true);
  });

  it('resolves a legal en passant capture into pieceMoved + pieceCaptured', () => {
    const whitePawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 4 });
    const blackPawn = mkPiece({ id: 'bp', color: ChessColor.BLACK, row: 4, column: 5 });
    const lastMove = mkPawnTwoStepMove(6, 5, 4, 5);
    const lastTurn = mkExecutedTurn({ moves: [lastMove] });

    const gs = mkSnapshot({ pieces: [whitePawn, blackPawn], turnHistory: [lastTurn] });
    const move = mkPawnEnPassantMove(4, 4, 5, 5);

    const effects = PawnEnPassantResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(2);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(whitePawn.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 5, column: 5 });
    expect(effect?.stateChanges[1]?.pieceCaptured?.pieceId).toBe(blackPawn.id);
  });

  it('throws IllegalMoveError when en passant is not legal', () => {
    const whitePawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 4 });
    const blackPawn = mkPiece({
      id: 'bp',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 4,
      column: 5,
    });
    const lastTurn = mkExecutedTurn({ moves: [] });
    const gs = mkSnapshot({ pieces: [whitePawn, blackPawn], turnHistory: [lastTurn] });
    const illegal = mkPawnEnPassantMove(4, 4, 5, 5);

    expect(() => PawnEnPassantResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });
});
