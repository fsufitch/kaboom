import { describe, expect, it } from 'vitest';

import { newReadonlyArray } from '@kaboom/engine/base';
import { KaboomEngine } from '@kaboom/engine/base/engine';
import type { GameSnapshotMutator, KaboomRuleset } from '@kaboom/engine/base/ruleset';
import {
  Effect,
  Effect_StateChange,
  Flag,
  GameSnapshot,
  ResolvedTurn,
  Variant,
} from '@kaboom/proto';

const mkSnapshot = (): GameSnapshot =>
  GameSnapshot.create({
    properties: { id: 'game-1', variant: Variant.CLASSIC },
  });

const mkRuleset = (gameSnapshotMutators: readonly GameSnapshotMutator[]): KaboomRuleset => ({
  id: 'test',
  name: 'Test Ruleset',
  gameSnapshotMutators: [...gameSnapshotMutators],
  moveResolvers: [],
  newGame: () => mkSnapshot(),
  parseTurn: () => {
    throw new Error('Not implemented for tests');
  },
  resolveTurn: () => {
    throw new Error('Not implemented for tests');
  },
});

const mkTurn = (stateChanges: readonly Effect_StateChange[]): ResolvedTurn =>
  ResolvedTurn.create({
    id: 'turn-1',
    playerId: 'player-1',
    moves: newReadonlyArray(),
    effects: newReadonlyArray(Effect.create({ stateChanges })),
    intendedAt: new Date('2020-01-01T00:00:00Z'),
    resolvedAt: new Date('2020-01-01T00:01:00Z'),
  });

describe('KaboomEngine.applyTurn', () => {
  it('applies mutators for each state change and records an executed turn', () => {
    const calls: string[] = [];
    const mutatorForFlag = (flagId: string): GameSnapshotMutator => ({
      applicable: (sc) => sc.createFlag?.flag?.id === flagId,
      mutate: (gsw, sc) => {
        calls.push(flagId);
        gsw.flags.push(Flag.create(sc.createFlag!.flag!));
      },
    });

    const ruleset = mkRuleset([mutatorForFlag('flag-1'), mutatorForFlag('flag-2')]);
    const engine = new KaboomEngine(ruleset);

    const snapshot = mkSnapshot();
    const stateChanges = [
      Effect_StateChange.create({ createFlag: { flag: Flag.create({ id: 'flag-1' }) } }),
      Effect_StateChange.create({ createFlag: { flag: Flag.create({ id: 'flag-2' }) } }),
    ];

    const nextSnapshot = engine.applyTurn(snapshot, mkTurn(stateChanges));

    expect(calls).toEqual(['flag-1', 'flag-2']);
    expect(nextSnapshot.flags.map((flag) => flag.id)).toEqual(['flag-1', 'flag-2']);
    expect(nextSnapshot.turnHistory).toHaveLength(1);
    expect(nextSnapshot.turnHistory[0]?.executedAt).toBeInstanceOf(Date);

    expect(snapshot).not.toBe(nextSnapshot);
    expect(snapshot.flags).toHaveLength(0);
    expect(snapshot.turnHistory).toHaveLength(0);
  });

  it('throws when no mutator can handle a state change', () => {
    const ruleset = mkRuleset([]);
    const engine = new KaboomEngine(ruleset);
    const snapshot = mkSnapshot();

    const stateChanges = [Effect_StateChange.create({ noOp: {} })];
    const turn = mkTurn(stateChanges);

    expect(() => engine.applyTurn(snapshot, turn)).toThrow('No mutator found for state change');
  });
});
