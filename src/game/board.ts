// ניהול לוח השחמט

import type { Board, Piece, Position, PlayerColor } from '../types/chess.types';
import { BOARD_SIZE, INITIAL_POSITIONS } from '../utils/constants';

/**
 * יוצר לוח שחמט ריק
 */
export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

/**
 * יוצר לוח שחמט עם הכלים במיקומי ההתחלה
 */
export function createInitialBoard(): Board {
  const board = createEmptyBoard();
  
  // מציב כלים לבנים
  board[7][4] = { type: 'king', color: 'white', hasMoved: false };
  board[7][3] = { type: 'queen', color: 'white', hasMoved: false };
  board[7][0] = { type: 'rook', color: 'white', hasMoved: false };
  board[7][7] = { type: 'rook', color: 'white', hasMoved: false };
  board[7][2] = { type: 'bishop', color: 'white', hasMoved: false };
  board[7][5] = { type: 'bishop', color: 'white', hasMoved: false };
  board[7][1] = { type: 'knight', color: 'white', hasMoved: false };
  board[7][6] = { type: 'knight', color: 'white', hasMoved: false };
  
  // רגלים לבנים
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
  }
  
  // מציב כלים שחורים
  board[0][4] = { type: 'king', color: 'black', hasMoved: false };
  board[0][3] = { type: 'queen', color: 'black', hasMoved: false };
  board[0][0] = { type: 'rook', color: 'black', hasMoved: false };
  board[0][7] = { type: 'rook', color: 'black', hasMoved: false };
  board[0][2] = { type: 'bishop', color: 'black', hasMoved: false };
  board[0][5] = { type: 'bishop', color: 'black', hasMoved: false };
  board[0][1] = { type: 'knight', color: 'black', hasMoved: false };
  board[0][6] = { type: 'knight', color: 'black', hasMoved: false };
  
  // רגלים שחורים
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
  }
  
  return board;
}

/**
 * מחזיר את הכלי במיקום מסוים
 */
export function getPieceAt(board: Board, position: Position): Piece | null {
  if (!isValidPosition(position)) {
    return null;
  }
  return board[position.row][position.col];
}

/**
 * מציב כלי במיקום מסוים
 */
export function setPieceAt(board: Board, position: Position, piece: Piece | null): Board {
  if (!isValidPosition(position)) {
    return board;
  }
  
  const newBoard = board.map(row => [...row]);
  newBoard[position.row][position.col] = piece;
  return newBoard;
}

/**
 * מזיז כלי ממיקום למיקום
 */
export function movePiece(board: Board, from: Position, to: Position): Board {
  const piece = getPieceAt(board, from);
  if (!piece) {
    return board;
  }
  
  let newBoard = setPieceAt(board, from, null);
  newBoard = setPieceAt(newBoard, to, { ...piece, hasMoved: true });
  
  return newBoard;
}

/**
 * בודק אם מיקום תקין על הלוח
 */
export function isValidPosition(position: Position): boolean {
  return position.row >= 0 && position.row < BOARD_SIZE &&
         position.col >= 0 && position.col < BOARD_SIZE;
}

/**
 * מחזיר את כל הכלים של שחקן מסוים
 */
export function getPlayerPieces(board: Board, color: PlayerColor): Array<{ piece: Piece; position: Position }> {
  const pieces: Array<{ piece: Piece; position: Position }> = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        pieces.push({ piece, position: { row, col } });
      }
    }
  }
  
  return pieces;
}

/**
 * מוצא את המלך של שחקן מסוים
 */
export function findKing(board: Board, color: PlayerColor): Position | null {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

/**
 * משכפל לוח
 */
export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
} 