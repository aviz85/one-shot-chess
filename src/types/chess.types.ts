// טיפוסים בסיסיים למשחק שחמט

// צבע השחקן
export type PlayerColor = 'white' | 'black';

// סוגי כלים
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

// מיקום על הלוח
export interface Position {
  row: number; // 0-7
  col: number; // 0-7
}

// כלי שחמט
export interface Piece {
  type: PieceType;
  color: PlayerColor;
  hasMoved: boolean; // חשוב להצרחה ולמהלך ראשון של רגלי
}

// משבצת על הלוח
export type Square = Piece | null;

// לוח שחמט - מערך דו-ממדי 8x8
export type Board = Square[][];

// סוגי מהלכים מיוחדים
export type SpecialMoveType = 'castling' | 'enPassant' | 'promotion';

// מהלך
export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isStalemate?: boolean;
  specialMove?: SpecialMoveType;
  // פרטים למהלכים מיוחדים
  castlingType?: 'kingside' | 'queenside';
  enPassantTarget?: Position;
  promotionPiece?: PieceType;
  // מיקום נוסף להצרחה (מיקום הצריח)
  rookMove?: {
    from: Position;
    to: Position;
  };
}

// מצב משחק
export interface GameState {
  board: Board;
  currentPlayer: PlayerColor;
  moves: Move[];
  capturedPieces: {
    white: Piece[];
    black: Piece[];
  };
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  enPassantTarget?: Position; // למהלך אן פסאן
  halfMoveClock: number; // לחוק 50 המהלכים
  fullMoveNumber: number;
  // זכויות הצרחה
  castlingRights: {
    white: {
      kingside: boolean;
      queenside: boolean;
    };
    black: {
      kingside: boolean;
      queenside: boolean;
    };
  };
}

// הגדרות משחק
export interface GameSettings {
  playerNames: {
    white: string;
    black: string;
  };
  timeControl?: {
    initialTime: number; // בשניות
    increment: number; // בשניות
  };
}

// סטטוס משחק
export type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished';

// תוצאת משחק
export interface GameResult {
  winner?: PlayerColor;
  reason: 'checkmate' | 'stalemate' | 'resignation' | 'timeout' | 'draw';
}

// מידע על משחק שמור
export interface SavedGame {
  id: string;
  name: string;
  gameState: GameState;
  settings: GameSettings;
  createdAt: Date;
  lastModified: Date;
} 