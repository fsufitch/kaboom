#!/usr/bin/env node

import { KaboomEngine } from '@kaboom/engine';
import { ClassicChessRuleset } from '@kaboom/engine/classic';
import { IntendedTurn } from '@kaboom/proto';

const engine = new KaboomEngine(ClassicChessRuleset);
let game = ClassicChessRuleset.newGame();

console.log('Game Snapshot:', JSON.stringify(game, null, 2));

const turn1Intended = IntendedTurn.create({
  id: 'turn-1',
  intendedAt: new Date(),
  playerId: game.players[0]!.id,
  moves: [
    {
      classicMove: {
        pawn: {
          twoStep: {
            from: { boardId: game.boards[0]!.id, boardPosition: { row: 1, column: 4 } },
            to: { boardId: game.boards[0]!.id, boardPosition: { row: 3, column: 4 } },
          },
        },
      },
    },
  ] as IntendedTurn['moves'],
});

console.log('--------------------------------');
console.log('Intended Turn:', JSON.stringify(turn1Intended, null, 2));

const turn1Resolved = engine.ruleset.resolveTurn(game, turn1Intended);
game = engine.applyTurn(game, turn1Resolved);
console.log('--------------------------------');
console.log('Resolved Turn:', JSON.stringify(turn1Resolved, null, 2));

console.log('--------------------------------');
console.log('Game Snapshot:', JSON.stringify(game, null, 2));
