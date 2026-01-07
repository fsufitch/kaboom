import { describe, expect, it } from 'vitest';

import { DeleteFlagMutator, InvalidStateChangeError } from '@kaboom/engine/base/mutators';
import { writable } from '@kaboom/engine/base/types';
import { Effect_StateChange } from '@kaboom/proto';

import { mkFlag, mkSnapshot } from './mutators_helpers';

describe('DeleteFlagMutator', () => {
  it('matches only deleteFlag state changes', () => {
    const deleteFlag = Effect_StateChange.create({ deleteFlag: { flagId: 'flag-1' } });
    const other = Effect_StateChange.create({ noOp: {} });

    expect(DeleteFlagMutator.applicable(deleteFlag)).toBe(true);
    expect(DeleteFlagMutator.applicable(other)).toBe(false);
  });

  it('removes an existing flag', () => {
    const gsw = writable(mkSnapshot({ flags: [mkFlag('flag-1'), mkFlag('flag-2')] }));
    const stateChange = Effect_StateChange.create({ deleteFlag: { flagId: 'flag-1' } });

    DeleteFlagMutator.mutate(gsw, stateChange);

    expect(gsw.flags.map((flag) => flag.id)).toEqual(['flag-2']);
  });

  it('rejects missing flag IDs', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({ deleteFlag: {} });

    expect(() => DeleteFlagMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects deleting a missing flag', () => {
    const gsw = writable(mkSnapshot({ flags: [mkFlag('flag-1')] }));
    const stateChange = Effect_StateChange.create({ deleteFlag: { flagId: 'flag-2' } });

    expect(() => DeleteFlagMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });
});
