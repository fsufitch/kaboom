import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { KingMoveResolver } from '@kaboom/engine/classic/king_move';
import { ChessColor, ChessPiece, ChessPieceKind, Move, Place } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkKingMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      king: {
        move: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('KingMoveResolver (classic)', () => {
  it('enumerates adjacent empty squares only', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 3, column: 3 });
    const enemy = mkPiece({
      id: 'enemy',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 4,
      column: 3,
    });
    const friendly = mkPiece({
      id: 'friendly',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.WHITE,
      row: 4,
      column: 4,
    });

    const gs = mkSnapshot({ pieces: [king, enemy, friendly] });

    const moves = KingMoveResolver.validMoves(gs, king.id);

    const expected = [
      mkKingMove(3, 3, 4, 2),
      mkKingMove(3, 3, 3, 4),
      mkKingMove(3, 3, 3, 2),
      mkKingMove(3, 3, 2, 4),
      mkKingMove(3, 3, 2, 3),
      mkKingMove(3, 3, 2, 2),
    ];

    expect(moves).toHaveLength(6);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }

    expect(moves.some((m) => movesEqual(m, mkKingMove(3, 3, 4, 3)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkKingMove(3, 3, 4, 4)))).toBe(false);
  });

  it('skips off-board destinations when on the edge', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 0 });
    const gs = mkSnapshot({ pieces: [king] });

    const moves = KingMoveResolver.validMoves(gs, king.id);

    expect(moves).toHaveLength(3);
    expect(moves.some((m) => movesEqual(m, mkKingMove(0, 0, 0, 1)))).toBe(true);
    expect(moves.some((m) => movesEqual(m, mkKingMove(0, 0, 1, 0)))).toBe(true);
    expect(moves.some((m) => movesEqual(m, mkKingMove(0, 0, 1, 1)))).toBe(true);
  });

  it('resolves a legal king move into pieceMoved', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [king] });
    const move = mkKingMove(3, 3, 4, 2);

    const effects = KingMoveResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(1);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(king.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 4, column: 2 });
  });

  it('throws IllegalMoveError for an illegal king move', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [king] });
    const illegal = mkKingMove(3, 3, 5, 3);

    expect(() => KingMoveResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });

  it('validates invariant checks for king moves', () => {
    expect(() => KingMoveResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const unplaced = ChessPiece.create({
      id: 'wk-unplaced',
      kind: ChessPieceKind.KING,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => KingMoveResolver.validMoves(gsUnplaced, unplaced.id)).toThrow('not on a board');

    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 3, column: 3 });
    const gsWrong = mkSnapshot({ pieces: [pawn] });
    expect(() => KingMoveResolver.validMoves(gsWrong, pawn.id)).toThrow('not a King');

    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 2, column: 2 });
    const gsKing = mkSnapshot({ pieces: [king] });
    const badBoardMove = Move.create({
      classicMove: {
        king: {
          move: {
            from: { boardId: 'unknown', boardPosition: { row: 2, column: 2 } },
            to: { boardId: 'unknown', boardPosition: { row: 3, column: 2 } },
          },
        },
      },
    });
    expect(() => KingMoveResolver.getMovedPieceIds(gsKing, badBoardMove)).toThrow(
      "unknown board ID 'unknown'",
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        king: {
          move: {
            from: { boardPosition: { row: 2, column: 2 } },
            to: { boardId: BOARD_ID, boardPosition: { row: 3, column: 2 } },
          },
        },
      },
    });
    expect(() => KingMoveResolver.getMovedPieceIds(gsKing, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyMove = mkKingMove(2, 2, 3, 2);
    expect(() => KingMoveResolver.getMovedPieceIds(mkSnapshot(), emptyMove)).toThrow(
      'no piece at position',
    );
  });

  it('rejects moves that are not king moves', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [king] });

    expect(() => KingMoveResolver.getMovedPieceIds(gs, Move.create({}))).toThrow('not a King move');
    expect(() => KingMoveResolver.resolveToEffects(gs, Move.create({}))).toThrow('not a King move');

    const bishop = mkPiece({ id: 'wb', kind: ChessPieceKind.BISHOP, row: 2, column: 2 });
    const gsWrong = mkSnapshot({ pieces: [bishop] });
    const move = mkKingMove(2, 2, 3, 2);
    expect(() => KingMoveResolver.resolveToEffects(gsWrong, move)).toThrow('not a King');
  });

  it('guards against inconsistent moved piece resolution', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [king] });
    const move = mkKingMove(2, 2, 3, 2);

    const emptySpy = vi.spyOn(KingMoveResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => KingMoveResolver.resolveToEffects(gs, move)).toThrow(
      'King move should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi.spyOn(KingMoveResolver, 'getMovedPieceIds').mockReturnValue(['x']);
    expect(() => KingMoveResolver.resolveToEffects(gs, move)).toThrow(
      "could not find king piece with ID 'x'",
    );
    missingSpy.mockRestore();
  });
});
