// חוקי תנועה של כלי שחמט

import type { Board, Position, Piece, PlayerColor, GameState } from '../types/chess.types';
import { getPieceAt, isValidPosition, movePiece, findKing } from './board';

/**
 * מחזיר את כל המהלכים האפשריים לכלי מסוים
 */
export function getPossibleMoves(board: Board, position: Position, gameState?: GameState): Position[] {
  const piece = getPieceAt(board, position);
  if (!piece) return [];

  let moves: Position[] = [];

  switch (piece.type) {
    case 'pawn':
      moves = getPawnMoves(board, position, piece, gameState);
      break;
    case 'knight':
      moves = getKnightMoves(board, position, piece);
      break;
    case 'bishop':
      moves = getBishopMoves(board, position, piece);
      break;
    case 'rook':
      moves = getRookMoves(board, position, piece);
      break;
    case 'queen':
      moves = getQueenMoves(board, position, piece);
      break;
    case 'king':
      moves = getKingMoves(board, position, piece, gameState);
      break;
  }

  // מסנן מהלכים שמשאירים את המלך בשח
  return moves.filter(to => !wouldBeInCheck(board, position, to, piece.color));
}

/**
 * מהלכי רגלי (כולל אן פסאן)
 */
function getPawnMoves(board: Board, position: Position, piece: Piece, gameState?: GameState): Position[] {
  const moves: Position[] = [];
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;

  // מהלך קדימה
  const oneStep = { row: position.row + direction, col: position.col };
  if (isValidPosition(oneStep) && !getPieceAt(board, oneStep)) {
    moves.push(oneStep);

    // מהלך כפול מהשורה ההתחלתית
    if (position.row === startRow) {
      const twoSteps = { row: position.row + 2 * direction, col: position.col };
      if (!getPieceAt(board, twoSteps)) {
        moves.push(twoSteps);
      }
    }
  }

  // אכילה באלכסון
  const captureLeft = { row: position.row + direction, col: position.col - 1 };
  const captureRight = { row: position.row + direction, col: position.col + 1 };

  for (const capture of [captureLeft, captureRight]) {
    if (isValidPosition(capture)) {
      const target = getPieceAt(board, capture);
      if (target && target.color !== piece.color) {
        moves.push(capture);
      }
    }
  }

  // אן פסאן
  if (gameState?.enPassantTarget) {
    const enPassantRow = piece.color === 'white' ? 3 : 4;
    if (position.row === enPassantRow) {
      const leftEnPassant = { row: position.row + direction, col: position.col - 1 };
      const rightEnPassant = { row: position.row + direction, col: position.col + 1 };
      
      if (gameState.enPassantTarget.row === leftEnPassant.row && 
          gameState.enPassantTarget.col === leftEnPassant.col) {
        moves.push(leftEnPassant);
      }
      
      if (gameState.enPassantTarget.row === rightEnPassant.row && 
          gameState.enPassantTarget.col === rightEnPassant.col) {
        moves.push(rightEnPassant);
      }
    }
  }

  return moves;
}

/**
 * מהלכי פרש
 */
function getKnightMoves(board: Board, position: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const knightMoves = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 }, { row: 1, col: 2 },
    { row: 2, col: -1 }, { row: 2, col: 1 }
  ];

  for (const move of knightMoves) {
    const newPos = { row: position.row + move.row, col: position.col + move.col };
    if (isValidPosition(newPos)) {
      const target = getPieceAt(board, newPos);
      if (!target || target.color !== piece.color) {
        moves.push(newPos);
      }
    }
  }

  return moves;
}

/**
 * מהלכי רץ
 */
function getBishopMoves(board: Board, position: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 1 }
  ];

  for (const dir of directions) {
    let currentPos = { row: position.row + dir.row, col: position.col + dir.col };
    
    while (isValidPosition(currentPos)) {
      const target = getPieceAt(board, currentPos);
      
      if (!target) {
        moves.push({ ...currentPos });
      } else {
        if (target.color !== piece.color) {
          moves.push({ ...currentPos });
        }
        break;
      }
      
      currentPos = { row: currentPos.row + dir.row, col: currentPos.col + dir.col };
    }
  }

  return moves;
}

/**
 * מהלכי צריח
 */
function getRookMoves(board: Board, position: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: 0 }, { row: 1, col: 0 },
    { row: 0, col: -1 }, { row: 0, col: 1 }
  ];

  for (const dir of directions) {
    let currentPos = { row: position.row + dir.row, col: position.col + dir.col };
    
    while (isValidPosition(currentPos)) {
      const target = getPieceAt(board, currentPos);
      
      if (!target) {
        moves.push({ ...currentPos });
      } else {
        if (target.color !== piece.color) {
          moves.push({ ...currentPos });
        }
        break;
      }
      
      currentPos = { row: currentPos.row + dir.row, col: currentPos.col + dir.col };
    }
  }

  return moves;
}

/**
 * מהלכי מלכה
 */
function getQueenMoves(board: Board, position: Position, piece: Piece): Position[] {
  // המלכה זזה כמו צריח + רץ
  return [...getRookMoves(board, position, piece), ...getBishopMoves(board, position, piece)];
}

/**
 * מהלכי מלך (כולל הצרחה)
 */
function getKingMoves(board: Board, position: Position, piece: Piece, gameState?: GameState): Position[] {
  const moves: Position[] = [];
  const kingMoves = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 }, { row: 0, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
  ];

  for (const move of kingMoves) {
    const newPos = { row: position.row + move.row, col: position.col + move.col };
    if (isValidPosition(newPos)) {
      const target = getPieceAt(board, newPos);
      if (!target || target.color !== piece.color) {
        // בדיקה שהמשבצת לא מותקפת
        if (!isSquareAttacked(board, newPos, piece.color === 'white' ? 'black' : 'white')) {
          moves.push(newPos);
        }
      }
    }
  }

  // הצרחה
  if (gameState && canCastle(board, piece.color, gameState)) {
    const row = piece.color === 'white' ? 7 : 0;
    
    // הצרחה קצרה (מלכותית)
    if (gameState.castlingRights[piece.color].kingside) {
      if (canCastleKingside(board, piece.color, row)) {
        moves.push({ row, col: 6 });
      }
    }
    
    // הצרחה ארוכה (מלכתית)
    if (gameState.castlingRights[piece.color].queenside) {
      if (canCastleQueenside(board, piece.color, row)) {
        moves.push({ row, col: 2 });
      }
    }
  }

  return moves;
}

/**
 * בודק אם מהלך יגרום למלך להיות בשח
 */
function wouldBeInCheck(board: Board, from: Position, to: Position, color: PlayerColor): boolean {
  // יוצר לוח זמני עם המהלך
  const tempBoard = movePiece(board, from, to);
  
  // מוצא את המלך
  const kingPos = findKing(tempBoard, color);
  if (!kingPos) return true; // אם אין מלך, זה בעייתי
  
  // בודק אם המלך מותקף
  return isSquareAttacked(tempBoard, kingPos, color === 'white' ? 'black' : 'white');
}

/**
 * בודק אם משבצת מותקפת על ידי שחקן מסוים
 */
export function isSquareAttacked(board: Board, position: Position, byColor: PlayerColor): boolean {
  // בודק כל כלי של השחקן התוקף
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        const moves = getAttackingMoves(board, { row, col }, piece);
        if (moves.some(move => move.row === position.row && move.col === position.col)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * מחזיר מהלכי תקיפה (ללא בדיקת שח)
 */
function getAttackingMoves(board: Board, position: Position, piece: Piece): Position[] {
  switch (piece.type) {
    case 'pawn':
      return getPawnAttacks(position, piece);
    case 'knight':
      return getKnightMoves(board, position, piece);
    case 'bishop':
      return getBishopMoves(board, position, piece);
    case 'rook':
      return getRookMoves(board, position, piece);
    case 'queen':
      return getQueenMoves(board, position, piece);
    case 'king':
      return getBasicKingMoves(board, position, piece);
    default:
      return [];
  }
}

/**
 * מהלכי תקיפה של רגלי
 */
function getPawnAttacks(position: Position, piece: Piece): Position[] {
  const attacks: Position[] = [];
  const direction = piece.color === 'white' ? -1 : 1;
  
  const leftAttack = { row: position.row + direction, col: position.col - 1 };
  const rightAttack = { row: position.row + direction, col: position.col + 1 };
  
  if (isValidPosition(leftAttack)) attacks.push(leftAttack);
  if (isValidPosition(rightAttack)) attacks.push(rightAttack);
  
  return attacks;
}

/**
 * מהלכי מלך בסיסיים (ללא בדיקת שח)
 */
function getBasicKingMoves(board: Board, position: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const kingMoves = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 }, { row: 0, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
  ];

  for (const move of kingMoves) {
    const newPos = { row: position.row + move.row, col: position.col + move.col };
    if (isValidPosition(newPos)) {
      const target = getPieceAt(board, newPos);
      if (!target || target.color !== piece.color) {
        moves.push(newPos);
      }
    }
  }

  return moves;
}

/**
 * בודק אם ניתן לבצע הצרחה
 */
function canCastle(board: Board, color: PlayerColor, gameState: GameState): boolean {
  // המלך לא יכול להיות בשח
  if (gameState.isCheck) return false;
  
  // המלך לא יכול להיות זז
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  
  const king = getPieceAt(board, kingPos);
  if (!king || king.hasMoved) return false;
  
  return true;
}

/**
 * בודק אם ניתן לבצע הצרחה קצרה
 */
function canCastleKingside(board: Board, color: PlayerColor, row: number): boolean {
  // בדיקה שהמשבצות ריקות
  if (getPieceAt(board, { row, col: 5 }) || getPieceAt(board, { row, col: 6 })) {
    return false;
  }
  
  // בדיקה שהצריח לא זז
  const rook = getPieceAt(board, { row, col: 7 });
  if (!rook || rook.type !== 'rook' || rook.color !== color || rook.hasMoved) {
    return false;
  }
  
  // בדיקה שהמלך לא עובר דרך שח
  const enemyColor = color === 'white' ? 'black' : 'white';
  if (isSquareAttacked(board, { row, col: 4 }, enemyColor) ||
      isSquareAttacked(board, { row, col: 5 }, enemyColor) ||
      isSquareAttacked(board, { row, col: 6 }, enemyColor)) {
    return false;
  }
  
  return true;
}

/**
 * בודק אם ניתן לבצע הצרחה ארוכה
 */
function canCastleQueenside(board: Board, color: PlayerColor, row: number): boolean {
  // בדיקה שהמשבצות ריקות
  if (getPieceAt(board, { row, col: 1 }) || 
      getPieceAt(board, { row, col: 2 }) || 
      getPieceAt(board, { row, col: 3 })) {
    return false;
  }
  
  // בדיקה שהצריח לא זז
  const rook = getPieceAt(board, { row, col: 0 });
  if (!rook || rook.type !== 'rook' || rook.color !== color || rook.hasMoved) {
    return false;
  }
  
  // בדיקה שהמלך לא עובר דרך שח
  const enemyColor = color === 'white' ? 'black' : 'white';
  if (isSquareAttacked(board, { row, col: 4 }, enemyColor) ||
      isSquareAttacked(board, { row, col: 3 }, enemyColor) ||
      isSquareAttacked(board, { row, col: 2 }, enemyColor)) {
    return false;
  }
  
  return true;
} 