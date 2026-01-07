import { getPlayerColor } from '@kaboom/engine';
import { getClassicBoard } from '@kaboom/engine/classic/utils';
import { GameSnapshot } from '@kaboom/proto';

import FischerSpassky1972 from './example_games/1972-07-23_fischer_spassky';
import NikolicArsovic1989 from './example_games/1989-02-00_nikolic_arsovic';
import KasparovDeepBlue1997 from './example_games/1997-05-11_kasparov_deepblue';

const examineGame = (game: GameSnapshot, name: string) => {
  console.log('========================================');
  console.log(`Examining game: ${name}`);

  const board = getClassicBoard(game);

  console.log('Players:');
  game.players.forEach((player) => {
    console.log(
      `- ${player.name} (ID: ${player.id}, Color: ${getPlayerColor(game, board.id, player.id)})`,
    );
  });

  console.log('Number of turns:', game.turnHistory.length);

  const gameJson = GameSnapshot.toJSON(game);
  const gameJsonStr = JSON.stringify(gameJson);
  console.log('Game JSON size (bytes):', Buffer.byteLength(gameJsonStr, 'utf-8'));

  const gameProto = GameSnapshot.encode(game).finish();
  console.log('Game protobuf size (bytes):', gameProto.length);

  const firstIntendedMoveTimestamp = game.turnHistory[0]?.intendedAt;
  console.log('First intended move timestamp:', firstIntendedMoveTimestamp);
  const lastIntendedMoveExecutedTimestamp =
    game.turnHistory[game.turnHistory.length - 1]?.executedAt;
  console.log('Last executed move timestamp:', lastIntendedMoveExecutedTimestamp);
  console.log(
    'Total game replay time:',
    lastIntendedMoveExecutedTimestamp?.getTime()! - firstIntendedMoveTimestamp?.getTime()!,
    'ms',
  );
};

examineGame(FischerSpassky1972, 'Fischer vs Spassky, 1972-07-23');
examineGame(NikolicArsovic1989, 'Nikolic vs Arsovic, 1989-02-00');
examineGame(KasparovDeepBlue1997, 'Kasparov vs Deep Blue, 1997-05-11');
