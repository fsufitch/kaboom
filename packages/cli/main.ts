#!/usr/bin/env node

import { ClassicChessRuleset } from '@kaboom/engine/classic';

const game = ClassicChessRuleset.newGame();

console.log('Game Snapshot:', JSON.stringify(game, null, 2));
