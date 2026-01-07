import { describe, expect, it } from 'vitest';

import { InvalidStateChangeError, PiecePromotedMutator } from '@kaboom/engine/base/mutators';
import { writable } from '@kaboom/engine/base/types';
import { ChessPieceKind, Effect_StateChange } from '@kaboom/proto';

import { mkPiece, mkSnapshot } from './mutators_helpers';

describe('PiecePromotedMutator', () => {
  it('matches only piecePromoted state changes', () => {
    const promoted = Effect_StateChange.create({
      piecePromoted: { pieceId: 'p1', newKind: ChessPieceKind.QUEEN },
    });
    const other = Effect_StateChange.create({ pieceMoved: { pieceId: 'p1', to: { row: 1, column: 1 } } });

    expect(PiecePromotedMutator.applicable(promoted)).toBe(true);
    expect(PiecePromotedMutator.applicable(other)).toBe(false);
  });

  it('promotes a pawn to the new kind', () => {
    const pawn = mkPiece({ id: 'p1', kind: ChessPieceKind.PAWN });
    const gsw = writable(mkSnapshot({ pieces: [pawn] }));
    const stateChange = Effect_StateChange.create({
      piecePromoted: { pieceId: 'p1', newKind: ChessPieceKind.QUEEN },
    });

    PiecePromotedMutator.mutate(gsw, stateChange);

    const promoted = gsw.pieces.find((p) => p.id === 'p1');
    expect(promoted?.promotedKind).toBe(ChessPieceKind.QUEEN);
  });

  it('rejects missing piece IDs', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({
      piecePromoted: { newKind: ChessPieceKind.QUEEN },
    });

    expect(() => PiecePromotedMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects unknown promotion kinds', () => {
    const pawn = mkPiece({ id: 'p1', kind: ChessPieceKind.PAWN });
    const gsw = writable(mkSnapshot({ pieces: [pawn] }));
    const stateChange = Effect_StateChange.create({
      piecePromoted: { pieceId: 'p1', newKind: ChessPieceKind.KIND_UNKNOWN },
    });

    expect(() => PiecePromotedMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects promotions for missing pieces', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({
      piecePromoted: { pieceId: 'missing', newKind: ChessPieceKind.QUEEN },
    });

    expect(() => PiecePromotedMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects promotions for non-pawns', () => {
    const bishop = mkPiece({ id: 'p1', kind: ChessPieceKind.BISHOP });
    const gsw = writable(mkSnapshot({ pieces: [bishop] }));
    const stateChange = Effect_StateChange.create({
      piecePromoted: { pieceId: 'p1', newKind: ChessPieceKind.QUEEN },
    });

    expect(() => PiecePromotedMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });
});
