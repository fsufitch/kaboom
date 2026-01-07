import { describe, expect, it } from 'vitest';

import { NoOpMutator } from '@kaboom/engine/base/mutators';
import { writable } from '@kaboom/engine/base/types';
import { Effect_StateChange, GameSnapshot } from '@kaboom/proto';

import { mkFlag, mkSnapshot } from './mutators_helpers';

describe('NoOpMutator', () => {
  it('matches only noOp state changes', () => {
    const noOp = Effect_StateChange.create({ noOp: {} });
    const other = Effect_StateChange.create({ pieceCaptured: { pieceId: 'p1' } });

    expect(NoOpMutator.applicable(noOp)).toBe(true);
    expect(NoOpMutator.applicable(other)).toBe(false);
  });

  it('does not mutate the snapshot', () => {
    const snapshot = mkSnapshot({ flags: [mkFlag('flag-1')] });
    const gsw = writable(GameSnapshot.create(snapshot));
    const stateChange = Effect_StateChange.create({ noOp: {} });

    NoOpMutator.mutate(gsw, stateChange);

    expect(gsw.flags).toHaveLength(1);
    expect(gsw.flags[0]?.id).toBe('flag-1');
  });
});
