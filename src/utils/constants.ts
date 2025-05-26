// קבועים למשחק שחמט

import type { PieceType } from '../types/chess.types';

// גודל הלוח
export const BOARD_SIZE = 8;

// ערכי כלים (לחישוב יתרון)
export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0, // המלך לא נחשב בחישוב יתרון
};

// סימבולים של כלים ב-Unicode
export const PIECE_SYMBOLS = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  },
};

// צבעי משבצות
export const SQUARE_COLORS = {
  light: '#F0D9B5',
  dark: '#1e3a8a',
  highlight: '#829769',
  selected: '#FFFF33',
  possibleMove: '#646F4080',
  check: '#FF6B6B',
};

// מיקומי התחלה של כלים
export const INITIAL_POSITIONS = {
  white: {
    king: { row: 7, col: 4 },
    queen: { row: 7, col: 3 },
    rooks: [{ row: 7, col: 0 }, { row: 7, col: 7 }],
    bishops: [{ row: 7, col: 2 }, { row: 7, col: 5 }],
    knights: [{ row: 7, col: 1 }, { row: 7, col: 6 }],
    pawns: Array.from({ length: 8 }, (_, i) => ({ row: 6, col: i })),
  },
  black: {
    king: { row: 0, col: 4 },
    queen: { row: 0, col: 3 },
    rooks: [{ row: 0, col: 0 }, { row: 0, col: 7 }],
    bishops: [{ row: 0, col: 2 }, { row: 0, col: 5 }],
    knights: [{ row: 0, col: 1 }, { row: 0, col: 6 }],
    pawns: Array.from({ length: 8 }, (_, i) => ({ row: 1, col: i })),
  },
};

// אותיות עמודות
export const FILE_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח'];

// מספרי שורות (בסדר הפוך לתצוגה)
export const RANK_NUMBERS = ['8', '7', '6', '5', '4', '3', '2', '1']; 