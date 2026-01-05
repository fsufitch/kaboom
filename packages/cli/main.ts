#!/usr/bin/env node

import * as P from '@kaboom/proto';

const game = P.GameSnapshot.create({
  players: [
    P.Player.create({ id: 'player1', name: 'Alice' }),
    P.Player.create({ id: 'player2', name: 'Bob' }),
  ] as ReadonlyArray<P.Player>,
  boards: [
    P.ChessBoard.create({ id: 'board1', columns: 8, rows: 8, activeColor: P.ChessColor.WHITE }),
  ] as ReadonlyArray<P.ChessBoard>,
});

console.log('Game Snapshot:', JSON.stringify(game, null, 2));
