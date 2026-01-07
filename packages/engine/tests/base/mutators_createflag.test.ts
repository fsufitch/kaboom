import { describe, expect, it } from 'vitest';

import { CreateFlagMutator, InvalidStateChangeError } from '@kaboom/engine/base/mutators';
import { writable } from '@kaboom/engine/base/types';
import { Effect_StateChange, Flag } from '@kaboom/proto';

import { mkFlag, mkSnapshot } from './mutators_helpers';

describe('CreateFlagMutator', () => {
  it('matches only createFlag state changes', () => {
    const createFlag = Effect_StateChange.create({ createFlag: { flag: mkFlag('flag-1') } });
    const other = Effect_StateChange.create({ deleteFlag: { flagId: 'flag-1' } });

    expect(CreateFlagMutator.applicable(createFlag)).toBe(true);
    expect(CreateFlagMutator.applicable(other)).toBe(false);
  });

  it('adds a new flag', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({ createFlag: { flag: mkFlag('flag-1') } });

    CreateFlagMutator.mutate(gsw, stateChange);

    expect(gsw.flags).toHaveLength(1);
    expect(gsw.flags[0]?.id).toBe('flag-1');
  });

  it('rejects missing flag data', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({ createFlag: {} });

    expect(() => CreateFlagMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects flags without IDs', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({ createFlag: { flag: Flag.create({}) } });

    expect(() => CreateFlagMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects duplicate flag IDs', () => {
    const gsw = writable(mkSnapshot({ flags: [mkFlag('flag-1')] }));
    const stateChange = Effect_StateChange.create({ createFlag: { flag: mkFlag('flag-1') } });

    expect(() => CreateFlagMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });
});
