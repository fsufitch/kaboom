import { KaboomEngine } from '@kaboom/engine';
import { ClassicChessRuleset } from '@kaboom/engine/classic';
import { IntendedTurn } from '@kaboom/proto';

import { createClassicMoveBuilders } from './helpers';

const engine = new KaboomEngine(ClassicChessRuleset);
let game = ClassicChessRuleset.newGame({
  gameId: '1997-05-11_kasparov_deepblue',
  whitePlayerId: 'white',
  whitePlayerName: 'Deep Blue',
  blackPlayerId: 'black',
  blackPlayerName: 'Garry Kasparov',
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

play(whiteId, [pawnTwoStep(square('e', 2), square('e', 4))]);
play(blackId, [pawnOneStep(square('c', 7), square('c', 6))]);
play(whiteId, [pawnTwoStep(square('d', 2), square('d', 4))]);
play(blackId, [pawnTwoStep(square('d', 7), square('d', 5))]);
play(whiteId, [knightMove(square('b', 1), square('c', 3))]);
play(blackId, [pawnCapture(square('d', 5), square('e', 4))]);
play(whiteId, [knightCapture(square('c', 3), square('e', 4))]);
play(blackId, [knightMove(square('b', 8), square('d', 7))]);
play(whiteId, [knightMove(square('e', 4), square('g', 5))]);
play(blackId, [knightMove(square('g', 8), square('f', 6))]);
play(whiteId, [bishopMove(square('f', 1), square('d', 3))]);
play(blackId, [pawnOneStep(square('e', 7), square('e', 6))]);
play(whiteId, [knightMove(square('g', 1), square('f', 3))]);
play(blackId, [pawnOneStep(square('h', 7), square('h', 6))]);
play(whiteId, [knightCapture(square('g', 5), square('e', 6))]);
play(blackId, [queenMove(square('d', 8), square('e', 7))]);
play(whiteId, [kingCastle(square('e', 1), square('g', 1), square('h', 1), square('f', 1))]);
play(blackId, [pawnCapture(square('f', 7), square('e', 6))]);
play(whiteId, [bishopMove(square('d', 3), square('g', 6))]);
play(blackId, [kingMove(square('e', 8), square('d', 8))]);
play(whiteId, [bishopMove(square('c', 1), square('f', 4))]);
play(blackId, [pawnTwoStep(square('b', 7), square('b', 5))]);
play(whiteId, [pawnTwoStep(square('a', 2), square('a', 4))]);
play(blackId, [bishopMove(square('c', 8), square('b', 7))]);
play(whiteId, [rookMove(square('f', 1), square('e', 1))]);
play(blackId, [knightMove(square('f', 6), square('d', 5))]);
play(whiteId, [bishopMove(square('f', 4), square('g', 3))]);
play(blackId, [kingMove(square('d', 8), square('c', 8))]);
play(whiteId, [pawnCapture(square('a', 4), square('b', 5))]);
play(blackId, [pawnCapture(square('c', 6), square('b', 5))]);
play(whiteId, [queenMove(square('d', 1), square('d', 3))]);
play(blackId, [bishopMove(square('b', 7), square('c', 6))]);
play(whiteId, [bishopMove(square('g', 6), square('f', 5))]);
play(blackId, [pawnCapture(square('e', 6), square('f', 5))]);
play(whiteId, [rookCapture(square('e', 1), square('e', 7))]);
play(blackId, [bishopCapture(square('f', 8), square('e', 7))]);
play(whiteId, [pawnTwoStep(square('c', 2), square('c', 4))]);

export default game;
