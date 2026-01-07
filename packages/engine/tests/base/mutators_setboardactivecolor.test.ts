import { describe, expect, it } from 'vitest';

import { InvalidStateChangeError, SetBoardActiveColorMutator } from '@kaboom/engine/base/mutators';
import { writable } from '@kaboom/engine/base/types';
import { ChessColor, Effect_StateChange } from '@kaboom/proto';

import { BOARD_ID, mkBoard, mkSnapshot } from './mutators_helpers';

describe('SetBoardActiveColorMutator', () => {
  it('matches only setBoardActiveColor state changes', () => {
    const stateChange = Effect_StateChange.create({
      setBoardActiveColor: { boardId: BOARD_ID, activeColor: ChessColor.BLACK },
    });
    const other = Effect_StateChange.create({ noOp: {} });

    expect(SetBoardActiveColorMutator.applicable(stateChange)).toBe(true);
    expect(SetBoardActiveColorMutator.applicable(other)).toBe(false);
  });

  it('updates the board active color', () => {
    const gsw = writable(mkSnapshot({ boards: [mkBoard({ activeColor: ChessColor.WHITE })] }));
    const stateChange = Effect_StateChange.create({
      setBoardActiveColor: { boardId: BOARD_ID, activeColor: ChessColor.BLACK },
    });

    SetBoardActiveColorMutator.mutate(gsw, stateChange);

    expect(gsw.boards[0]?.activeColor).toBe(ChessColor.BLACK);
  });

  it('rejects missing board IDs', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({
      setBoardActiveColor: { activeColor: ChessColor.BLACK },
    });

    expect(() => SetBoardActiveColorMutator.mutate(gsw, stateChange)).toThrow(
      InvalidStateChangeError,
    );
  });

  it('defaults missing active colors to COLOR_UNKNOWN', () => {
    const gsw = writable(mkSnapshot({ boards: [mkBoard({ activeColor: ChessColor.WHITE })] }));
    const stateChange = Effect_StateChange.create({
      setBoardActiveColor: { boardId: BOARD_ID } as any,
    });

    SetBoardActiveColorMutator.mutate(gsw, stateChange);

    expect(gsw.boards[0]?.activeColor).toBe(ChessColor.COLOR_UNKNOWN);
  });

  it('rejects unknown board IDs', () => {
    const gsw = writable(mkSnapshot({ boards: [mkBoard({ id: 'other-board' })] }));
    const stateChange = Effect_StateChange.create({
      setBoardActiveColor: { boardId: BOARD_ID, activeColor: ChessColor.BLACK },
    });

    expect(() => SetBoardActiveColorMutator.mutate(gsw, stateChange)).toThrow(
      InvalidStateChangeError,
    );
  });
});
