import { describe, expect, it } from 'vitest';

import { newClassicChessGame } from '@kaboom/engine/classic/new_game';
import { ChessColor, ChessPieceKind, Variant } from '@kaboom/proto';

describe('newClassicChessGame', () => {
  it('creates a classic game with default IDs, players, and board', () => {
    const snapshot = newClassicChessGame();

    expect(snapshot.properties?.variant).toBe(Variant.CLASSIC);
    expect(snapshot.properties?.id).toBe('game-1');

    expect(snapshot.players).toHaveLength(2);
    expect(snapshot.players[0]?.id).toBe('player-1');
    expect(snapshot.players[1]?.id).toBe('player-2');

    expect(snapshot.boards).toHaveLength(1);
    const board = snapshot.boards[0];
    expect(board?.id).toBe('classic-board');
    expect(board?.rows).toBe(8);
    expect(board?.columns).toBe(8);
    expect(board?.activeColor).toBe(ChessColor.WHITE);

    expect(snapshot.boardPlayers).toHaveLength(2);
    expect(snapshot.boardPlayers[0]?.boardId).toBe('classic-board');
    expect(snapshot.boardPlayers[0]?.playerId).toBe('player-1');
    expect(snapshot.boardPlayers[0]?.color).toBe(ChessColor.WHITE);
    expect(snapshot.boardPlayers[1]?.playerId).toBe('player-2');
    expect(snapshot.boardPlayers[1]?.color).toBe(ChessColor.BLACK);
  });

  it('creates the full classic starting piece set', () => {
    const snapshot = newClassicChessGame();

    expect(snapshot.pieces).toHaveLength(32);

    const getPiece = (id: string) => snapshot.pieces.find((piece) => piece.id === id);

    const whiteKing = getPiece('wk');
    const blackKing = getPiece('bk');
    const whitePawn = getPiece('wp1');
    const blackPawn = getPiece('bp8');

    expect(whiteKing?.kind).toBe(ChessPieceKind.KING);
    expect(whiteKing?.color).toBe(ChessColor.WHITE);
    expect(whiteKing?.place?.boardId).toBe('classic-board');
    expect(whiteKing?.place?.boardPosition).toEqual({ row: 0, column: 4 });

    expect(blackKing?.kind).toBe(ChessPieceKind.KING);
    expect(blackKing?.color).toBe(ChessColor.BLACK);
    expect(blackKing?.place?.boardPosition).toEqual({ row: 7, column: 4 });

    expect(whitePawn?.kind).toBe(ChessPieceKind.PAWN);
    expect(whitePawn?.place?.boardPosition).toEqual({ row: 1, column: 0 });

    expect(blackPawn?.kind).toBe(ChessPieceKind.PAWN);
    expect(blackPawn?.place?.boardPosition).toEqual({ row: 6, column: 7 });
  });

  it('respects custom game and player metadata', () => {
    const snapshot = newClassicChessGame({
      gameId: 'game-9',
      whitePlayerId: 'white-1',
      whitePlayerName: 'Alice',
      blackPlayerId: 'black-1',
      blackPlayerName: 'Bob',
    });

    expect(snapshot.properties?.id).toBe('game-9');
    expect(snapshot.players[0]?.id).toBe('white-1');
    expect(snapshot.players[0]?.name).toBe('Alice');
    expect(snapshot.players[1]?.id).toBe('black-1');
    expect(snapshot.players[1]?.name).toBe('Bob');
  });
});
