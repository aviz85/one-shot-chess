// לוגיקת משחק שחמט ראשית

import type { GameState, Board, Position, Move, PlayerColor } from '../types/chess.types';
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
    fullMoveNumber: 1
  };
}

/**
 * מבצע מהלך במשחק
 */
export function makeMove(gameState: GameState, from: Position, to: Position): GameState | null {
  const piece = getPieceAt(gameState.board, from);
  
  // בדיקות תקינות בסיסיות
  if (!piece || piece.color !== gameState.currentPlayer) {
    return null;
  }
  
  // בודק אם המהלך חוקי
  const possibleMoves = getPossibleMoves(gameState.board, from);
  const isValidMove = possibleMoves.some(move => move.row === to.row && move.col === to.col);
  
  if (!isValidMove) {
    return null;
  }
  
  // מבצע את המהלך
  const capturedPiece = getPieceAt(gameState.board, to);
  const newBoard = movePiece(gameState.board, from, to);
  
  // יוצר אובייקט מהלך
  const move: Move = {
    from,
    to,
    piece,
    capturedPiece: capturedPiece || undefined
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
    fullMoveNumber: gameState.currentPlayer === 'black' ? gameState.fullMoveNumber + 1 : gameState.fullMoveNumber
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
  // אם לא בשח, אין מט
  if (!gameState.isCheck) return false;
  
  // בודק אם יש מהלך חוקי כלשהו
  return !hasLegalMoves(gameState);
}

/**
 * בודק אם יש פט
 */
export function isStalemate(gameState: GameState): boolean {
  // אם בשח, אין פט
  if (gameState.isCheck) return false;
  
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
    const moves = getPossibleMoves(gameState.board, position);
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
    const moves = getPossibleMoves(gameState.board, position);
    for (const to of moves) {
      legalMoves.push({ from: position, to });
    }
  }
  
  return legalMoves;
} 