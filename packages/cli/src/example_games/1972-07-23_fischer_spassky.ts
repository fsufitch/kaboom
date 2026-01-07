import { KaboomEngine } from '@kaboom/engine';
import { ClassicChessRuleset } from '@kaboom/engine/classic';
import { IntendedTurn } from '@kaboom/proto';

import { createClassicMoveBuilders } from './helpers';

const engine = new KaboomEngine(ClassicChessRuleset);
let game = ClassicChessRuleset.newGame({
  gameId: '1972-07-23_fischer_spassky',
  whitePlayerId: 'white',
  whitePlayerName: 'Robert James Fischer',
  blackPlayerId: 'black',
  blackPlayerName: 'Boris Spassky',
});

const boardId = game.boards[0]!.id;
const whiteId = game.players[0]!.id;
const blackId = game.players[1]!.id;

const {
  square,
  pawnOneStep,
  pawnTwoStep,
  pawnCapture,
  rookMove,
  rookCapture,
  knightMove,
  knightCapture,
  bishopMove,
  bishopCapture,
  queenMove,
  queenCapture,
  kingMove,
  kingCastle,
} = createClassicMoveBuilders(boardId);

let turnId = 1;
const play = (playerId: string, moves: IntendedTurn['moves']) => {
  const intendedTurn = IntendedTurn.create({
    id: `turn-${turnId++}`,
    intendedAt: new Date(),
    playerId,
    moves,
  });
  const resolvedTurn = engine.ruleset.resolveTurn(game, intendedTurn);
  game = engine.applyTurn(game, resolvedTurn);
};

play(whiteId, [pawnTwoStep(square('c', 2), square('c', 4))]);
play(blackId, [pawnOneStep(square('e', 7), square('e', 6))]);
play(whiteId, [knightMove(square('g', 1), square('f', 3))]);
play(blackId, [pawnTwoStep(square('d', 7), square('d', 5))]);
play(whiteId, [pawnTwoStep(square('d', 2), square('d', 4))]);
play(blackId, [knightMove(square('g', 8), square('f', 6))]);
play(whiteId, [knightMove(square('b', 1), square('c', 3))]);
play(blackId, [bishopMove(square('f', 8), square('e', 7))]);
play(whiteId, [bishopMove(square('c', 1), square('g', 5))]);
play(blackId, [kingCastle(square('e', 8), square('g', 8), square('h', 8), square('f', 8))]);
play(whiteId, [pawnOneStep(square('e', 2), square('e', 3))]);
play(blackId, [pawnOneStep(square('h', 7), square('h', 6))]);
play(whiteId, [bishopMove(square('g', 5), square('h', 4))]);
play(blackId, [pawnOneStep(square('b', 7), square('b', 6))]);
play(whiteId, [pawnCapture(square('c', 4), square('d', 5))]);
play(blackId, [knightCapture(square('f', 6), square('d', 5))]);
play(whiteId, [bishopCapture(square('h', 4), square('e', 7))]);
play(blackId, [queenCapture(square('d', 8), square('e', 7))]);
play(whiteId, [knightCapture(square('c', 3), square('d', 5))]);
play(blackId, [pawnCapture(square('e', 6), square('d', 5))]);
play(whiteId, [rookMove(square('a', 1), square('c', 1))]);
play(blackId, [bishopMove(square('c', 8), square('e', 6))]);
play(whiteId, [queenMove(square('d', 1), square('a', 4))]);
play(blackId, [pawnTwoStep(square('c', 7), square('c', 5))]);
play(whiteId, [queenMove(square('a', 4), square('a', 3))]);
play(blackId, [rookMove(square('f', 8), square('c', 8))]);
play(whiteId, [bishopMove(square('f', 1), square('b', 5))]);
play(blackId, [pawnOneStep(square('a', 7), square('a', 6))]);
play(whiteId, [pawnCapture(square('d', 4), square('c', 5))]);
play(blackId, [pawnCapture(square('b', 6), square('c', 5))]);
play(whiteId, [kingCastle(square('e', 1), square('g', 1), square('h', 1), square('f', 1))]);
play(blackId, [rookMove(square('a', 8), square('a', 7))]);
play(whiteId, [bishopMove(square('b', 5), square('e', 2))]);
play(blackId, [knightMove(square('b', 8), square('d', 7))]);
play(whiteId, [knightMove(square('f', 3), square('d', 4))]);
play(blackId, [queenMove(square('e', 7), square('f', 8))]);
play(whiteId, [knightCapture(square('d', 4), square('e', 6))]);
play(blackId, [pawnCapture(square('f', 7), square('e', 6))]);
play(whiteId, [pawnOneStep(square('e', 3), square('e', 4))]);
play(blackId, [pawnOneStep(square('d', 5), square('d', 4))]);
play(whiteId, [pawnTwoStep(square('f', 2), square('f', 4))]);
play(blackId, [queenMove(square('f', 8), square('e', 7))]);
play(whiteId, [pawnOneStep(square('e', 4), square('e', 5))]);
play(blackId, [rookMove(square('c', 8), square('b', 8))]);
play(whiteId, [bishopMove(square('e', 2), square('c', 4))]);
play(blackId, [kingMove(square('g', 8), square('h', 8))]);
play(whiteId, [queenMove(square('a', 3), square('h', 3))]);
play(blackId, [knightMove(square('d', 7), square('f', 8))]);
play(whiteId, [pawnOneStep(square('b', 2), square('b', 3))]);
play(blackId, [pawnOneStep(square('a', 6), square('a', 5))]);
play(whiteId, [pawnOneStep(square('f', 4), square('f', 5))]);
play(blackId, [pawnCapture(square('e', 6), square('f', 5))]);
play(whiteId, [rookCapture(square('f', 1), square('f', 5))]);
play(blackId, [knightMove(square('f', 8), square('h', 7))]);
play(whiteId, [rookMove(square('c', 1), square('f', 1))]);
play(blackId, [queenMove(square('e', 7), square('d', 8))]);
play(whiteId, [queenMove(square('h', 3), square('g', 3))]);
play(blackId, [rookMove(square('a', 7), square('e', 7))]);
play(whiteId, [pawnTwoStep(square('h', 2), square('h', 4))]);
play(blackId, [rookMove(square('b', 8), square('b', 7))]);
play(whiteId, [pawnOneStep(square('e', 5), square('e', 6))]);
play(blackId, [rookMove(square('b', 7), square('c', 7))]);
play(whiteId, [queenMove(square('g', 3), square('e', 5))]);
play(blackId, [queenMove(square('d', 8), square('e', 8))]);
play(whiteId, [pawnTwoStep(square('a', 2), square('a', 4))]);
play(blackId, [queenMove(square('e', 8), square('d', 8))]);
play(whiteId, [rookMove(square('f', 1), square('f', 2))]);
play(blackId, [queenMove(square('d', 8), square('e', 8))]);
play(whiteId, [rookMove(square('f', 2), square('f', 3))]);
play(blackId, [queenMove(square('e', 8), square('d', 8))]);
play(whiteId, [bishopMove(square('c', 4), square('d', 3))]);
play(blackId, [queenMove(square('d', 8), square('e', 8))]);
play(whiteId, [queenMove(square('e', 5), square('e', 4))]);
play(blackId, [knightMove(square('h', 7), square('f', 6))]);
play(whiteId, [rookCapture(square('f', 5), square('f', 6))]);
play(blackId, [pawnCapture(square('g', 7), square('f', 6))]);
play(whiteId, [rookCapture(square('f', 3), square('f', 6))]);
play(blackId, [kingMove(square('h', 8), square('g', 8))]);
play(whiteId, [bishopMove(square('d', 3), square('c', 4))]);
play(blackId, [kingMove(square('g', 8), square('h', 8))]);
play(whiteId, [queenMove(square('e', 4), square('f', 4))]);

export default game;
