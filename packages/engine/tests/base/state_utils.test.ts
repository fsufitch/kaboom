import { describe, expect, it } from 'vitest';

import type { GameSnapshotMutator } from '@kaboom/engine/base/ruleset';
import {
  applyEffectInPlace,
  applyStateChangeInPlace,
  getBoardById,
  getFlagById,
  getPieceAtBoardPosition,
  getPieceById,
  getPlayerColor,
  getSingleBoard,
  movesEqual,
  truePieceKind,
} from '@kaboom/engine/base/state_utils';
import { newReadonlyArray, writable } from '@kaboom/engine/base/types';
import {
  ChessBoardPlayer,
  ChessColor,
  ChessPiece,
  ChessPieceKind,
  Effect,
  Effect_StateChange,
  GameSnapshot,
  Move,
  Place,
  Place_Benched,
} from '@kaboom/proto';

import { BOARD_ID, mkBoard, mkFlag, mkPiece, mkSnapshot } from './mutators_helpers';

const mkPawnMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
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

describe('getFlagById', () => {
  it('returns the flag when present', () => {
    const flag = mkFlag('flag-1');
    const gs = mkSnapshot({ flags: [flag] });

    expect(getFlagById(gs, 'flag-1')).toEqual(flag);
  });

  it('returns undefined when the flag is missing', () => {
    const gs = mkSnapshot({ flags: [mkFlag('flag-1')] });

    expect(getFlagById(gs, 'missing')).toBeUndefined();
  });
});

describe('getPieceById', () => {
  it('returns the piece when present', () => {
    const piece = mkPiece({ id: 'p1' });
    const gs = mkSnapshot({ pieces: [piece] });

    expect(getPieceById(gs, 'p1')).toEqual(piece);
  });

  it('returns undefined when the piece is missing', () => {
    const gs = mkSnapshot({ pieces: [mkPiece({ id: 'p1' })] });

    expect(getPieceById(gs, 'missing')).toBeUndefined();
  });
});

describe('getBoardById', () => {
  it('returns the board when present', () => {
    const board = mkBoard();
    const gs = mkSnapshot({ boards: [board] });

    expect(getBoardById(gs, BOARD_ID)).toEqual(board);
  });

  it('returns undefined when the board is missing', () => {
    const gs = mkSnapshot({ boards: [mkBoard()] });

    expect(getBoardById(gs, 'missing')).toBeUndefined();
  });
});

describe('getSingleBoard', () => {
  it('returns the only board in the snapshot', () => {
    const board = mkBoard();
    const gs = mkSnapshot({ boards: [board] });

    expect(getSingleBoard(gs)).toEqual(board);
  });

  it('throws when there is more than one board', () => {
    const gs = mkSnapshot({ boards: [mkBoard(), mkBoard({ id: 'board-2' })] });

    expect(() => getSingleBoard(gs)).toThrow('Expected exactly one board in the game snapshot');
  });
});

describe('getPlayerColor', () => {
  it('returns the player color for the matching board and player', () => {
    const gs = GameSnapshot.create({
      ...mkSnapshot(),
      boardPlayers: newReadonlyArray(
        ChessBoardPlayer.create({
          boardId: BOARD_ID,
          playerId: 'player-1',
          color: ChessColor.WHITE,
        }),
      ),
    });

    expect(getPlayerColor(gs, BOARD_ID, 'player-1')).toBe(ChessColor.WHITE);
  });

  it('returns undefined when no player match is found', () => {
    const gs = GameSnapshot.create({
      ...mkSnapshot(),
      boardPlayers: newReadonlyArray(
        ChessBoardPlayer.create({
          boardId: BOARD_ID,
          playerId: 'player-1',
          color: ChessColor.WHITE,
        }),
      ),
    });

    expect(getPlayerColor(gs, BOARD_ID, 'missing')).toBeUndefined();
  });
});

describe('getPieceAtBoardPosition', () => {
  it('returns the piece at the given position on the board', () => {
    const piece = mkPiece({ id: 'p1', row: 2, column: 3 });
    const gs = mkSnapshot({ pieces: [piece] });

    expect(getPieceAtBoardPosition(gs, BOARD_ID, { row: 2, column: 3 })).toEqual(piece);
  });

  it('returns undefined for benched or captured pieces', () => {
    const benched = ChessPiece.create({
      id: 'p1',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      place: Place.create({
        boardId: BOARD_ID,
        benched: Place_Benched.create({ holderColor: ChessColor.WHITE }),
      }),
    });
    const gs = mkSnapshot({ pieces: [benched] });

    expect(getPieceAtBoardPosition(gs, BOARD_ID, { row: 0, column: 0 })).toBeUndefined();
  });
});

describe('truePieceKind', () => {
  it('returns the promoted kind when present', () => {
    const piece = ChessPiece.create({
      id: 'p1',
      kind: ChessPieceKind.PAWN,
      promotedKind: ChessPieceKind.QUEEN,
    });

    expect(truePieceKind(piece)).toBe(ChessPieceKind.QUEEN);
  });

  it('falls back to the base kind when promoted kind is unknown', () => {
    const piece = ChessPiece.create({
      id: 'p1',
      kind: ChessPieceKind.ROOK,
      promotedKind: ChessPieceKind.KIND_UNKNOWN,
    });

    expect(truePieceKind(piece)).toBe(ChessPieceKind.ROOK);
  });
});

describe('movesEqual', () => {
  it('returns true for equivalent moves', () => {
    const moveA = mkPawnMove(1, 1, 2, 1);
    const moveB = mkPawnMove(1, 1, 2, 1);

    expect(movesEqual(moveA, moveB)).toBe(true);
  });

  it('returns false for different moves', () => {
    const moveA = mkPawnMove(1, 1, 2, 1);
    const moveB = mkPawnMove(1, 1, 3, 1);

    expect(movesEqual(moveA, moveB)).toBe(false);
  });
});

describe('applyEffectInPlace', () => {
  it('applies each state change using the matching mutator', () => {
    const calls: string[] = [];
    const gsw = writable(mkSnapshot());
    const effect = Effect.create({
      stateChanges: newReadonlyArray(
        Effect_StateChange.create({ noOp: {} }),
        Effect_StateChange.create({ createFlag: { flag: mkFlag('flag-1') } }),
      ),
    });

    const mutators: GameSnapshotMutator[] = [
      {
        applicable: (stateChange) => !!stateChange.noOp,
        mutate: () => calls.push('noOp'),
      },
      {
        applicable: (stateChange) => !!stateChange.createFlag,
        mutate: () => calls.push('createFlag'),
      },
    ];

    applyEffectInPlace(gsw, effect, mutators);

    expect(calls).toEqual(['noOp', 'createFlag']);
  });

  it('throws when a state change has no mutator', () => {
    const gsw = writable(mkSnapshot());
    const effect = Effect.create({
      stateChanges: newReadonlyArray(Effect_StateChange.create({ noOp: {} })),
    });

    expect(() => applyEffectInPlace(gsw, effect, [])).toThrow('No mutator found');
  });
});

describe('applyStateChangeInPlace', () => {
  it('uses the applicable mutator to update the snapshot', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({ noOp: {} });
    const mutator: GameSnapshotMutator = {
      applicable: (sc) => !!sc.noOp,
      mutate: (snapshot) => snapshot.flags.push(mkFlag('flag-1')),
    };

    applyStateChangeInPlace(gsw, stateChange, [mutator]);

    expect(gsw.flags.map((flag) => flag.id)).toEqual(['flag-1']);
  });

  it('throws when no mutators are applicable', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({ noOp: {} });

    expect(() => applyStateChangeInPlace(gsw, stateChange, [])).toThrow('No mutator found');
  });

  it('throws when multiple mutators apply', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({ noOp: {} });
    const mutators: GameSnapshotMutator[] = [
      { applicable: () => true, mutate: () => {} },
      { applicable: () => true, mutate: () => {} },
    ];

    expect(() => applyStateChangeInPlace(gsw, stateChange, mutators)).toThrow(
      'Multiple mutators found',
    );
  });
});
