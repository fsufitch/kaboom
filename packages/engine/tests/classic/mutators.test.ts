import { describe, expect, it } from 'vitest';

import { InvalidStateChangeError, newReadonlyArray, writable } from '@kaboom/engine/base';
import { PieceCapturedMutator } from '@kaboom/engine/classic/mutators';
import { ChessColor, ChessPiece, ChessPieceKind, Effect_StateChange, Place } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

describe('PieceCapturedMutator (classic)', () => {
  it('matches only pieceCaptured state changes', () => {
    const pieceCaptured = Effect_StateChange.create({ pieceCaptured: { pieceId: 'p1' } });
    const other = Effect_StateChange.create({
      pieceMoved: { pieceId: 'p1', to: { row: 1, column: 2 } },
    });

    expect(PieceCapturedMutator.applicable(pieceCaptured)).toBe(true);
    expect(PieceCapturedMutator.applicable(other)).toBe(false);
  });

  it('marks the piece as captured and removes board position', () => {
    const piece = mkPiece({ id: 'p1', row: 2, column: 3 });
    const gsw = writable(mkSnapshot({ pieces: [piece] }));
    const stateChange = Effect_StateChange.create({ pieceCaptured: { pieceId: 'p1' } });

    PieceCapturedMutator.mutate(gsw, stateChange);

    const captured = gsw.pieces.find((p) => p.id === 'p1');
    expect(captured?.place?.boardPosition).toBeUndefined();
    expect(captured?.place?.captured).toBeDefined();
  });

  it('rejects missing piece IDs', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({ pieceCaptured: {} });

    expect(() => PieceCapturedMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects missing pieces', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({ pieceCaptured: { pieceId: 'missing' } });

    expect(() => PieceCapturedMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects pieces not on a board', () => {
    const piece = ChessPiece.create({
      id: 'p1',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsw = writable(mkSnapshot({ pieces: newReadonlyArray(piece) }));
    const stateChange = Effect_StateChange.create({ pieceCaptured: { pieceId: 'p1' } });

    expect(() => PieceCapturedMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });
});
