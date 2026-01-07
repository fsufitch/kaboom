import { describe, expect, it } from 'vitest';

import { movesEqual, newReadonlyArray } from '@kaboom/engine/base';
import { ClassicChessRuleset } from '@kaboom/engine/classic/ruleset';
import {
  ChessColor,
  ChessPieceKind,
  GameSnapshot,
  IntendedTurn,
  Move,
  Variant,
} from '@kaboom/proto';

import { BOARD_ID, mkBoard, mkPiece } from './helpers';

const WHITE_PLAYER_ID = 'player-white';
const BLACK_PLAYER_ID = 'player-black';

const mkSnapshotWithPlayers = (options: {
  pieces: readonly ReturnType<typeof mkPiece>[];
  activeColor?: ChessColor;
}): GameSnapshot => {
  const board = mkBoard({ activeColor: options.activeColor ?? ChessColor.WHITE });

  return GameSnapshot.create({
    properties: { id: 'game-1', variant: Variant.CLASSIC },
    boards: newReadonlyArray(board),
    pieces: newReadonlyArray(...options.pieces),
    players: newReadonlyArray({ id: WHITE_PLAYER_ID }, { id: BLACK_PLAYER_ID }),
    boardPlayers: newReadonlyArray(
      { boardId: board.id, playerId: WHITE_PLAYER_ID, color: ChessColor.WHITE },
      { boardId: board.id, playerId: BLACK_PLAYER_ID, color: ChessColor.BLACK },
    ),
    flags: newReadonlyArray(),
    turnHistory: newReadonlyArray(),
  });
};

const mkIntendedTurn = (playerId: string, moves: readonly Move[]) =>
  IntendedTurn.create({
    id: 'turn-1',
    playerId,
    moves: newReadonlyArray(...moves),
    intendedAt: new Date('2020-01-01T00:00:00Z'),
  });

const mkPawnOneStepMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      pawn: {
        oneStep: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

const mkPawnPromotionMove = (row: number, col: number, promoteTo: ChessPieceKind): Move =>
  Move.create({
    classicMove: {
      pawn: {
        promotion: {
          from: { boardId: BOARD_ID, boardPosition: { row, column: col } },
          promoteTo,
        },
      },
    },
  });

const mkRookMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      rook: {
        move: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('ClassicChessRuleset', () => {
  it('throws for parseTurn until implemented', () => {
    const snapshot = mkSnapshotWithPlayers({ pieces: [] });

    expect(() => ClassicChessRuleset.parseTurn(snapshot, 'raw-turn')).toThrow(
      'parseTurn is not implemented',
    );
  });

  it('throws when the player has no color on the board', () => {
    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 1, column: 0 });
    const board = mkBoard();
    const snapshot = GameSnapshot.create({
      properties: { id: 'game-1', variant: Variant.CLASSIC },
      boards: newReadonlyArray(board),
      pieces: newReadonlyArray(pawn),
      players: newReadonlyArray(),
      boardPlayers: newReadonlyArray(),
      flags: newReadonlyArray(),
      turnHistory: newReadonlyArray(),
    });

    const turn = mkIntendedTurn(WHITE_PLAYER_ID, [mkPawnOneStepMove(1, 0, 2, 0)]);

    expect(() => ClassicChessRuleset.resolveTurn(snapshot, turn)).toThrow(
      `Player with ID '${WHITE_PLAYER_ID}' does not have a color on board '${board.id}'`,
    );
  });

  it("throws when it is not the player's turn", () => {
    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 1, column: 0 });
    const snapshot = mkSnapshotWithPlayers({ pieces: [pawn], activeColor: ChessColor.WHITE });

    const turn = mkIntendedTurn(BLACK_PLAYER_ID, [mkPawnOneStepMove(1, 0, 2, 0)]);

    expect(() => ClassicChessRuleset.resolveTurn(snapshot, turn)).toThrow(
      `It is not player '${BLACK_PLAYER_ID}'s turn (active color is '${ChessColor.WHITE}')`,
    );
  });

  it('throws when no resolver can handle the move', () => {
    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 1, column: 0 });
    const snapshot = mkSnapshotWithPlayers({ pieces: [pawn] });

    const turn = mkIntendedTurn(WHITE_PLAYER_ID, [Move.create({})]);

    expect(() => ClassicChessRuleset.resolveTurn(snapshot, turn)).toThrow(
      'No resolver found for move',
    );
  });

  it('throws when a player attempts to move an opponent piece', () => {
    const blackPawn = mkPiece({
      id: 'bp',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 6,
      column: 0,
    });
    const snapshot = mkSnapshotWithPlayers({ pieces: [blackPawn], activeColor: ChessColor.WHITE });

    const turn = mkIntendedTurn(WHITE_PLAYER_ID, [mkPawnOneStepMove(6, 0, 5, 0)]);

    expect(() => ClassicChessRuleset.resolveTurn(snapshot, turn)).toThrow(
      `Player with ID '${WHITE_PLAYER_ID}' cannot move piece with ID '${blackPawn.id}'`,
    );
  });

  it('resolves a legal move and flips the active color', () => {
    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 1, column: 0 });
    const snapshot = mkSnapshotWithPlayers({ pieces: [pawn], activeColor: ChessColor.WHITE });
    const move = mkPawnOneStepMove(1, 0, 2, 0);

    const turn = mkIntendedTurn(WHITE_PLAYER_ID, [move]);
    const resolved = ClassicChessRuleset.resolveTurn(snapshot, turn);

    expect(resolved.playerId).toBe(WHITE_PLAYER_ID);
    expect(resolved.moves).toHaveLength(1);
    expect(movesEqual(resolved.moves[0]!, move)).toBe(true);
    expect(resolved.effects).toHaveLength(2);
    expect(resolved.resolvedAt).toBeInstanceOf(Date);

    const lastEffect = resolved.effects[1];
    const setColor = lastEffect?.stateChanges[0]?.setBoardActiveColor;
    expect(setColor?.boardId).toBe(BOARD_ID);
    expect(setColor?.activeColor).toBe(ChessColor.BLACK);
  });

  it('flips the active color from black to white after a black move', () => {
    const pawn = mkPiece({
      id: 'bp',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 6,
      column: 0,
    });
    const snapshot = mkSnapshotWithPlayers({ pieces: [pawn], activeColor: ChessColor.BLACK });
    const move = mkPawnOneStepMove(6, 0, 5, 0);

    const turn = mkIntendedTurn(BLACK_PLAYER_ID, [move]);
    const resolved = ClassicChessRuleset.resolveTurn(snapshot, turn);

    const lastEffect = resolved.effects[1];
    const setColor = lastEffect?.stateChanges[0]?.setBoardActiveColor;
    expect(setColor?.boardId).toBe(BOARD_ID);
    expect(setColor?.activeColor).toBe(ChessColor.WHITE);
  });

  it('resolves multiple moves in a single turn in order', () => {
    const pawnA = mkPiece({ id: 'wp1', kind: ChessPieceKind.PAWN, row: 1, column: 0 });
    const pawnB = mkPiece({ id: 'wp2', kind: ChessPieceKind.PAWN, row: 1, column: 1 });
    const snapshot = mkSnapshotWithPlayers({
      pieces: [pawnA, pawnB],
      activeColor: ChessColor.WHITE,
    });

    const moveA = mkPawnOneStepMove(1, 0, 2, 0);
    const moveB = mkPawnOneStepMove(1, 1, 2, 1);
    const turn = mkIntendedTurn(WHITE_PLAYER_ID, [moveA, moveB]);

    const resolved = ClassicChessRuleset.resolveTurn(snapshot, turn);

    expect(resolved.effects).toHaveLength(3);
    expect(movesEqual(resolved.moves[0]!, moveA)).toBe(true);
    expect(movesEqual(resolved.moves[1]!, moveB)).toBe(true);
  });

  it('resolves a pawn promotion sequence', () => {
    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 6, column: 0 });
    const snapshot = mkSnapshotWithPlayers({ pieces: [pawn], activeColor: ChessColor.WHITE });

    const advance = mkPawnOneStepMove(6, 0, 7, 0);
    const promote = mkPawnPromotionMove(7, 0, ChessPieceKind.QUEEN);
    const turn = mkIntendedTurn(WHITE_PLAYER_ID, [advance, promote]);

    const resolved = ClassicChessRuleset.resolveTurn(snapshot, turn);

    expect(resolved.effects).toHaveLength(3);
    expect(movesEqual(resolved.moves[0]!, advance)).toBe(true);
    expect(movesEqual(resolved.moves[1]!, promote)).toBe(true);
  });

  it.fails('rejects multi-move turns without promotion (TODO)', () => {
    const pawnA = mkPiece({ id: 'wp1', kind: ChessPieceKind.PAWN, row: 1, column: 0 });
    const pawnB = mkPiece({ id: 'wp2', kind: ChessPieceKind.PAWN, row: 1, column: 1 });
    const snapshot = mkSnapshotWithPlayers({
      pieces: [pawnA, pawnB],
      activeColor: ChessColor.WHITE,
    });

    const moveA = mkPawnOneStepMove(1, 0, 2, 0);
    const moveB = mkPawnOneStepMove(1, 1, 2, 1);
    const turn = mkIntendedTurn(WHITE_PLAYER_ID, [moveA, moveB]);

    expect(() => ClassicChessRuleset.resolveTurn(snapshot, turn)).toThrow();
  });

  it('rejects promotion when the pawn is not on the last rank', () => {
    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 5, column: 0 });
    const snapshot = mkSnapshotWithPlayers({ pieces: [pawn], activeColor: ChessColor.WHITE });

    const advance = mkPawnOneStepMove(5, 0, 6, 0);
    const promote = mkPawnPromotionMove(6, 0, ChessPieceKind.QUEEN);
    const turn = mkIntendedTurn(WHITE_PLAYER_ID, [advance, promote]);

    expect(() => ClassicChessRuleset.resolveTurn(snapshot, turn)).toThrow();
  });

  it.fails('rejects promotion when the pawn promoted is not the pawn that moved (TODO)', () => {
    const pawnA = mkPiece({ id: 'wp1', kind: ChessPieceKind.PAWN, row: 6, column: 0 });
    const pawnB = mkPiece({ id: 'wp2', kind: ChessPieceKind.PAWN, row: 7, column: 1 });
    const snapshot = mkSnapshotWithPlayers({
      pieces: [pawnA, pawnB],
      activeColor: ChessColor.WHITE,
    });

    const advance = mkPawnOneStepMove(6, 0, 7, 0);
    const promote = mkPawnPromotionMove(7, 1, ChessPieceKind.QUEEN);
    const turn = mkIntendedTurn(WHITE_PLAYER_ID, [advance, promote]);

    expect(() => ClassicChessRuleset.resolveTurn(snapshot, turn)).toThrow();
  });

  it.fails('rejects moves that leave the king in check (TODO)', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 4 });
    const blocker = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 0, column: 5 });
    const enemyRook = mkPiece({
      id: 'br',
      kind: ChessPieceKind.ROOK,
      color: ChessColor.BLACK,
      row: 0,
      column: 7,
    });

    const snapshot = mkSnapshotWithPlayers({
      pieces: [king, blocker, enemyRook],
      activeColor: ChessColor.WHITE,
    });

    const move = mkRookMove(0, 5, 1, 5);
    const turn = mkIntendedTurn(WHITE_PLAYER_ID, [move]);

    expect(() => ClassicChessRuleset.resolveTurn(snapshot, turn)).toThrow();
  });
});
