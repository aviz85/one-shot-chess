// לוגיקת משחק שחמט ראשית

import type { GameState, Board, Position, Move, PlayerColor, PieceType, Piece } from '../types/chess.types';
import { createInitialBoard, getPieceAt, movePiece, findKing, getPlayerPieces } from './board';
import { getPossibleMoves, isSquareAttacked } from './moves';

/**
 * יוצר מצב משחק חדש
 */
export function createNewGame(): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: 'white',
    moves: [],
    capturedPieces: {
      white: [],
      black: []
    },
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    castlingRights: {
      white: {
        kingside: true,
        queenside: true
      },
      black: {
        kingside: true,
        queenside: true
      }
    }
  };
}

/**
 * מבצע מהלך במשחק
 */
export function makeMove(gameState: GameState, from: Position, to: Position, promotionPiece?: PieceType): GameState | null {
  const piece = getPieceAt(gameState.board, from);
  
  // בדיקות תקינות בסיסיות
  if (!piece || piece.color !== gameState.currentPlayer) {
    return null;
  }
  
  // בודק אם המהלך חוקי
  const possibleMoves = getPossibleMoves(gameState.board, from, gameState);
  const isValidMove = possibleMoves.some(move => move.row === to.row && move.col === to.col);
  
  if (!isValidMove) {
    return null;
  }
  
  // זיהוי סוג המהלך המיוחד
  const specialMove = identifySpecialMove(gameState, from, to, piece);
  
  // מבצע את המהלך
  let newBoard = [...gameState.board.map(row => [...row])];
  let capturedPiece = getPieceAt(gameState.board, to);
  let rookMove: { from: Position; to: Position } | undefined;
  let enPassantTarget: Position | undefined;
  
  // טיפול במהלכים מיוחדים
  if (specialMove === 'castling') {
    const result = executeCastling(newBoard, from, to, piece);
    newBoard = result.board;
    rookMove = result.rookMove;
  } else if (specialMove === 'enPassant') {
    const result = executeEnPassant(newBoard, from, to, piece);
    newBoard = result.board;
    capturedPiece = result.capturedPiece;
  } else if (specialMove === 'promotion') {
    if (!promotionPiece) {
      promotionPiece = 'queen'; // ברירת מחדל
    }
    newBoard = executePromotion(newBoard, from, to, piece, promotionPiece);
  } else {
    // מהלך רגיל
    newBoard = movePiece(newBoard, from, to);
  }
  
  // עדכון זכויות הצרחה
  const newCastlingRights = updateCastlingRights(gameState.castlingRights, from, to, piece);
  
  // עדכון אן פסאן
  if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
    enPassantTarget = {
      row: (from.row + to.row) / 2,
      col: from.col
    };
  }
  
  // יוצר אובייקט מהלך
  const move: Move = {
    from,
    to,
    piece: { ...piece, hasMoved: true },
    capturedPiece: capturedPiece || undefined,
    specialMove,
    rookMove,
    enPassantTarget,
    promotionPiece
  };
  
  // מעדכן את מצב המשחק
  const newState: GameState = {
    ...gameState,
    board: newBoard,
    currentPlayer: gameState.currentPlayer === 'white' ? 'black' : 'white',
    moves: [...gameState.moves, move],
    capturedPieces: capturedPiece ? {
      ...gameState.capturedPieces,
      [capturedPiece.color]: [...gameState.capturedPieces[capturedPiece.color], capturedPiece]
    } : gameState.capturedPieces,
    halfMoveClock: capturedPiece || piece.type === 'pawn' ? 0 : gameState.halfMoveClock + 1,
    fullMoveNumber: gameState.currentPlayer === 'black' ? gameState.fullMoveNumber + 1 : gameState.fullMoveNumber,
    castlingRights: newCastlingRights,
    enPassantTarget
  };
  
  // בודק מצבי משחק מיוחדים
  newState.isCheck = isInCheck(newState.board, newState.currentPlayer);
  newState.isCheckmate = isCheckmate(newState);
  newState.isStalemate = isStalemate(newState);
  newState.isDraw = isDraw(newState);
  
  // מעדכן את המהלך עם מידע על שח/מט
  if (newState.isCheck) move.isCheck = true;
  if (newState.isCheckmate) move.isCheckmate = true;
  if (newState.isStalemate) move.isStalemate = true;
  
  return newState;
}

/**
 * בודק אם השחקן בשח
 */
export function isInCheck(board: Board, player: PlayerColor): boolean {
  const kingPos = findKing(board, player);
  if (!kingPos) return false;
  
  return isSquareAttacked(board, kingPos, player === 'white' ? 'black' : 'white');
}

/**
 * בודק אם יש מט
 */
export function isCheckmate(gameState: GameState): boolean {
  // בודק אם השחקן הנוכחי בשח
  const inCheck = isInCheck(gameState.board, gameState.currentPlayer);
  
  // אם לא בשח, אין מט
  if (!inCheck) return false;
  
  // בודק אם יש מהלך חוקי כלשהו
  return !hasLegalMoves(gameState);
}

/**
 * בודק אם יש פט
 */
export function isStalemate(gameState: GameState): boolean {
  // בודק אם השחקן הנוכחי בשח
  const inCheck = isInCheck(gameState.board, gameState.currentPlayer);
  
  // אם בשח, אין פט
  if (inCheck) return false;
  
  // בודק אם אין מהלכים חוקיים
  return !hasLegalMoves(gameState);
}

/**
 * בודק אם יש תיקו
 */
export function isDraw(gameState: GameState): boolean {
  // חוק 50 המהלכים
  if (gameState.halfMoveClock >= 100) return true;
  
  // בדיקת חומר לא מספיק למט
  if (isInsufficientMaterial(gameState.board)) return true;
  
  // TODO: בדיקת חזרה משולשת
  
  return false;
}

/**
 * בודק אם יש מהלכים חוקיים
 */
function hasLegalMoves(gameState: GameState): boolean {
  const pieces = getPlayerPieces(gameState.board, gameState.currentPlayer);
  
  for (const { position } of pieces) {
    const moves = getPossibleMoves(gameState.board, position, gameState);
    if (moves.length > 0) return true;
  }
  
  return false;
}

/**
 * בודק אם יש חומר מספיק למט
 */
function isInsufficientMaterial(board: Board): boolean {
  const whitePieces = getPlayerPieces(board, 'white');
  const blackPieces = getPlayerPieces(board, 'black');
  
  // מלך בלבד נגד מלך בלבד
  if (whitePieces.length === 1 && blackPieces.length === 1) return true;
  
  // מלך ורץ/פרש נגד מלך בלבד
  if (whitePieces.length === 2 && blackPieces.length === 1) {
    const piece = whitePieces.find(p => p.piece.type !== 'king');
    if (piece && (piece.piece.type === 'bishop' || piece.piece.type === 'knight')) return true;
  }
  
  if (blackPieces.length === 2 && whitePieces.length === 1) {
    const piece = blackPieces.find(p => p.piece.type !== 'king');
    if (piece && (piece.piece.type === 'bishop' || piece.piece.type === 'knight')) return true;
  }
  
  // TODO: מלך ורץ נגד מלך ורץ באותו צבע
  
  return false;
}

/**
 * מחזיר את כל המהלכים החוקיים לשחקן הנוכחי
 */
export function getAllLegalMoves(gameState: GameState): Array<{ from: Position; to: Position }> {
  const legalMoves: Array<{ from: Position; to: Position }> = [];
  const pieces = getPlayerPieces(gameState.board, gameState.currentPlayer);
  
  for (const { position } of pieces) {
    const moves = getPossibleMoves(gameState.board, position, gameState);
    for (const to of moves) {
      legalMoves.push({ from: position, to });
    }
  }
  
  return legalMoves;
}

/**
 * מזהה סוג מהלך מיוחד
 */
function identifySpecialMove(gameState: GameState, from: Position, to: Position, piece: Piece): 'castling' | 'enPassant' | 'promotion' | undefined {
  // הצרחה
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    return 'castling';
  }
  
  // אן פסאן
  if (piece.type === 'pawn' && Math.abs(to.col - from.col) === 1 && !getPieceAt(gameState.board, to)) {
    // בדיקה שהרגלי בשורה הנכונה לאן פסאן
    const enPassantRow = piece.color === 'white' ? 3 : 4;
    if (from.row === enPassantRow && gameState.enPassantTarget && 
        gameState.enPassantTarget.row === to.row && gameState.enPassantTarget.col === to.col) {
      return 'enPassant';
    }
  }
  
  // הכתרה
  if (piece.type === 'pawn') {
    const promotionRow = piece.color === 'white' ? 0 : 7;
    if (to.row === promotionRow) {
      return 'promotion';
    }
  }
  
  return undefined;
}

/**
 * מבצע הצרחה
 */
function executeCastling(board: Board, from: Position, to: Position, piece: Piece): { board: Board; rookMove: { from: Position; to: Position } } {
  const newBoard = [...board.map(row => [...row])];
  const row = piece.color === 'white' ? 7 : 0;
  
  // זיז את המלך
  newBoard[from.row][from.col] = null;
  newBoard[to.row][to.col] = { ...piece, hasMoved: true };
  
  let rookFrom: Position;
  let rookTo: Position;
  
  if (to.col === 6) { // הצרחה קצרה
    rookFrom = { row, col: 7 };
    rookTo = { row, col: 5 };
  } else { // הצרחה ארוכה
    rookFrom = { row, col: 0 };
    rookTo = { row, col: 3 };
  }
  
  // זיז את הצריח
  const rook = newBoard[rookFrom.row][rookFrom.col];
  if (rook) {
    newBoard[rookFrom.row][rookFrom.col] = null;
    newBoard[rookTo.row][rookTo.col] = { ...rook, hasMoved: true };
  }
  
  return {
    board: newBoard,
    rookMove: { from: rookFrom, to: rookTo }
  };
}

/**
 * מבצע אן פסאן
 */
function executeEnPassant(board: Board, from: Position, to: Position, piece: Piece): { board: Board; capturedPiece: Piece } {
  const newBoard = [...board.map(row => [...row])];
  
  // זיז את הרגלי
  newBoard[from.row][from.col] = null;
  newBoard[to.row][to.col] = { ...piece, hasMoved: true };
  
  // הסר את הרגלי הנאכל
  const capturedRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
  const capturedPiece = newBoard[capturedRow][to.col];
  newBoard[capturedRow][to.col] = null;
  
  return {
    board: newBoard,
    capturedPiece: capturedPiece!
  };
}

/**
 * מבצע הכתרה
 */
function executePromotion(board: Board, from: Position, to: Position, piece: Piece, promotionPiece: PieceType): Board {
  const newBoard = [...board.map(row => [...row])];
  
  // הסר את הרגלי המקורי
  newBoard[from.row][from.col] = null;
  
  // הוסף את הכלי החדש
  newBoard[to.row][to.col] = {
    type: promotionPiece,
    color: piece.color,
    hasMoved: true
  };
  
  return newBoard;
}

/**
 * מעדכן זכויות הצרחה
 */
function updateCastlingRights(
  currentRights: GameState['castlingRights'], 
  from: Position, 
  to: Position, 
  piece: Piece
): GameState['castlingRights'] {
  const newRights = {
    white: { ...currentRights.white },
    black: { ...currentRights.black }
  };
  
  // אם המלך זז
  if (piece.type === 'king') {
    newRights[piece.color as keyof typeof newRights].kingside = false;
    newRights[piece.color as keyof typeof newRights].queenside = false;
  }
  
  // אם צריח זז
  if (piece.type === 'rook') {
    const homeRow = piece.color === 'white' ? 7 : 0;
    if (from.row === homeRow) {
      if (from.col === 0) {
        newRights[piece.color as keyof typeof newRights].queenside = false;
      } else if (from.col === 7) {
        newRights[piece.color as keyof typeof newRights].kingside = false;
      }
    }
  }
  
  // אם צריח נאכל
  const homeRowWhite = 7;
  const homeRowBlack = 0;
  
  if (to.row === homeRowWhite && to.col === 0) {
    newRights.white.queenside = false;
  } else if (to.row === homeRowWhite && to.col === 7) {
    newRights.white.kingside = false;
  } else if (to.row === homeRowBlack && to.col === 0) {
    newRights.black.queenside = false;
  } else if (to.row === homeRowBlack && to.col === 7) {
    newRights.black.kingside = false;
  }
  
  return newRights;
} 