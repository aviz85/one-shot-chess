import { describe, it, expect } from 'vitest';
import { createNewGame, makeMove, isInCheck, isCheckmate, isStalemate } from '../src/game/gameLogic';
import { createInitialBoard, getPieceAt, getPlayerPieces } from '../src/game/board';
import { getPossibleMoves } from '../src/game/moves';
import type { GameState, Position } from '../src/types/chess.types';

describe('Game Logic Tests', () => {
  describe('createNewGame', () => {
    it('should create a new game with correct initial state', () => {
      const game = createNewGame();
      
      expect(game.currentPlayer).toBe('white');
      expect(game.moves).toHaveLength(0);
      expect(game.isCheck).toBe(false);
      expect(game.isCheckmate).toBe(false);
      expect(game.isStalemate).toBe(false);
      expect(game.isDraw).toBe(false);
      expect(game.fullMoveNumber).toBe(1);
      expect(game.halfMoveClock).toBe(0);
      
      // בדיקת זכויות הצרחה
      expect(game.castlingRights.white.kingside).toBe(true);
      expect(game.castlingRights.white.queenside).toBe(true);
      expect(game.castlingRights.black.kingside).toBe(true);
      expect(game.castlingRights.black.queenside).toBe(true);
    });

    it('should have correct initial board setup', () => {
      const game = createNewGame();
      const board = game.board;
      
      // בדיקת רגלים
      for (let col = 0; col < 8; col++) {
        expect(board[1][col]?.type).toBe('pawn');
        expect(board[1][col]?.color).toBe('black');
        expect(board[6][col]?.type).toBe('pawn');
        expect(board[6][col]?.color).toBe('white');
      }
      
      // בדיקת מלכים
      expect(board[0][4]?.type).toBe('king');
      expect(board[0][4]?.color).toBe('black');
      expect(board[7][4]?.type).toBe('king');
      expect(board[7][4]?.color).toBe('white');
      
      // בדיקת מלכות
      expect(board[0][3]?.type).toBe('queen');
      expect(board[0][3]?.color).toBe('black');
      expect(board[7][3]?.type).toBe('queen');
      expect(board[7][3]?.color).toBe('white');
    });
  });

  describe('makeMove', () => {
    it('should make a valid pawn move', () => {
      const game = createNewGame();
      const from: Position = { row: 6, col: 4 }; // e2
      const to: Position = { row: 4, col: 4 }; // e4
      
      const newGame = makeMove(game, from, to);
      
      expect(newGame).not.toBeNull();
      expect(newGame!.currentPlayer).toBe('black');
      expect(newGame!.moves).toHaveLength(1);
      expect(getPieceAt(newGame!.board, to)?.type).toBe('pawn');
      expect(getPieceAt(newGame!.board, from)).toBeNull();
    });

    it('should reject invalid moves', () => {
      const game = createNewGame();
      const from: Position = { row: 6, col: 4 }; // e2
      const to: Position = { row: 3, col: 4 }; // e5 (3 squares forward)
      
      const newGame = makeMove(game, from, to);
      
      expect(newGame).toBeNull();
    });

    it('should reject moves of wrong color', () => {
      const game = createNewGame();
      const from: Position = { row: 1, col: 4 }; // e7 (black pawn)
      const to: Position = { row: 3, col: 4 }; // e5
      
      const newGame = makeMove(game, from, to);
      
      expect(newGame).toBeNull();
    });

    it('should handle pawn promotion', () => {
      // יצירת מצב עם רגלי לבן בשורה השנייה (קרוב להכתרה)
      const game = createNewGame();
      game.board[1][0] = { type: 'pawn', color: 'white', hasMoved: true };
      game.board[0][0] = null; // הסרת צריח שחור
      game.currentPlayer = 'white';
      
      const from: Position = { row: 1, col: 0 };
      const to: Position = { row: 0, col: 0 };
      
      const newGame = makeMove(game, from, to, 'queen');
      
      expect(newGame).not.toBeNull();
      expect(getPieceAt(newGame!.board, to)?.type).toBe('queen');
      expect(getPieceAt(newGame!.board, to)?.color).toBe('white');
    });
  });

  describe('Special Moves', () => {
    it('should handle castling kingside', () => {
      const game = createNewGame();
      // הסרת כלים בין המלך לצריח
      game.board[7][5] = null; // bishop
      game.board[7][6] = null; // knight
      
      const from: Position = { row: 7, col: 4 }; // king
      const to: Position = { row: 7, col: 6 }; // castling position
      
      const newGame = makeMove(game, from, to);
      
      expect(newGame).not.toBeNull();
      expect(getPieceAt(newGame!.board, { row: 7, col: 6 })?.type).toBe('king');
      expect(getPieceAt(newGame!.board, { row: 7, col: 5 })?.type).toBe('rook');
      expect(newGame!.castlingRights.white.kingside).toBe(false);
    });

    it('should handle en passant', () => {
      const game = createNewGame();
      // הגדרת מצב אן פסאן נכון
      // רגלי לבן בשורה 3 (דרגה 5)
      game.board[3][4] = { type: 'pawn', color: 'white', hasMoved: true };
      // רגלי שחור בשורה 3 (דרגה 5) שזז זה עתה שני משבצות
      game.board[3][5] = { type: 'pawn', color: 'black', hasMoved: true };
      // מטרת אן פסאן - המשבצת שהרגלי השחור "עבר" עליה
      game.enPassantTarget = { row: 2, col: 5 };
      game.currentPlayer = 'white';
      
      const from: Position = { row: 3, col: 4 };
      const to: Position = { row: 2, col: 5 };
      
      const newGame = makeMove(game, from, to);
      
      expect(newGame).not.toBeNull();
      expect(getPieceAt(newGame!.board, to)?.type).toBe('pawn');
      expect(getPieceAt(newGame!.board, { row: 3, col: 5 })).toBeNull(); // הרגלי הנאכל
    });
  });

  describe('Check Detection', () => {
    it('should detect check', () => {
      const game = createNewGame();
      // הגדרת מצב שח
      game.board[7][4] = { type: 'king', color: 'white', hasMoved: false };
      game.board[0][4] = { type: 'rook', color: 'black', hasMoved: false };
      // הסרת כלים בדרך
      for (let row = 1; row < 7; row++) {
        game.board[row][4] = null;
      }
      
      const inCheck = isInCheck(game.board, 'white');
      expect(inCheck).toBe(true);
    });

    it('should not detect check when king is safe', () => {
      const game = createNewGame();
      const inCheck = isInCheck(game.board, 'white');
      expect(inCheck).toBe(false);
    });
  });

  describe('Game End Conditions', () => {
    it('should detect checkmate', () => {
      // יצירת מצב מט אמיתי - מלך לבן חסום בפינה
      const game = createNewGame();
      
      // ניקוי הלוח
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          game.board[row][col] = null;
        }
      }
      
      // מלך לבן ב-a1 (7,0) - פינה תחתונה שמאלית
      game.board[7][0] = { type: 'king', color: 'white', hasMoved: true };
      // מלכה שחורה ב-c1 (7,2) שתוקפת את המלך מהצד
      game.board[7][2] = { type: 'queen', color: 'black', hasMoved: true };
      // מלך שחור ב-b3 (5,1) שמונע מהמלך הלבן לברוח ל-b1 או b2
      game.board[5][1] = { type: 'king', color: 'black', hasMoved: true };
      
      game.currentPlayer = 'white';
      
      const isCheckMate = isCheckmate(game);
      expect(isCheckMate).toBe(true);
    });

    it('should detect stalemate', () => {
      // יצירת מצב פט פשוט
      const game = createNewGame();
      // ניקוי הלוח
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          game.board[row][col] = null;
        }
      }
      
      // מלך לבן בפינה
      game.board[7][0] = { type: 'king', color: 'white', hasMoved: true };
      // מלכה שחורה שחוסמת
      game.board[5][1] = { type: 'queen', color: 'black', hasMoved: true };
      game.board[6][2] = { type: 'king', color: 'black', hasMoved: true };
      
      game.currentPlayer = 'white';
      game.isCheck = false;
      
      const isStaleMate = isStalemate(game);
      expect(isStaleMate).toBe(true);
    });
  });
}); 