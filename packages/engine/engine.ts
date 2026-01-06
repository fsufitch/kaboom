import { GameSnapshot, type ResolvedTurn } from '@kaboom/proto';

import type { KaboomRuleset } from './base/ruleset';
import { writable } from './base/types';

export class KaboomEngine {
  constructor(public readonly ruleset: KaboomRuleset) {}

  applyTurn = (snapshot: GameSnapshot, turn: ResolvedTurn): GameSnapshot => {
    const nextSnapshot = writable(GameSnapshot.create(snapshot));

    const stateChanges = turn.effects.flatMap((eff) => eff.stateChanges ?? []);
    for (const stateChange of stateChanges) {
      const mutator = this.ruleset.gameSnapshotMutators.find((m) => m.applicable(stateChange));
      if (!mutator) {
        throw new Error(`No mutator found for state change: ${JSON.stringify(stateChange)}`);
      }
      mutator.mutate(nextSnapshot, stateChange);
    }

    nextSnapshot.turnHistory.push({
      ...writable(turn),
      executedAt: new Date(),
    });

    return nextSnapshot as GameSnapshot;
  };
}
