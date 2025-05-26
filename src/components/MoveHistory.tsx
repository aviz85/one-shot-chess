import { motion } from 'framer-motion';
import type { Move } from '../types/chess.types';

interface MoveHistoryProps {
  moves: Move[];
  onMoveClick?: (moveIndex: number) => void;
  currentMoveIndex?: number;
}

export default function MoveHistory({ moves, onMoveClick, currentMoveIndex }: MoveHistoryProps) {
  const formatMove = (move: Move): string => {
    const { piece, from, to, capturedPiece, specialMove, isCheck, isCheckmate } = move;
    
    let notation = '';
    
    // סימון הכלי
    if (piece.type !== 'pawn') {
      const pieceSymbols = {
        king: 'מ',
        queen: 'מל',
        rook: 'צ',
        bishop: 'ר',
        knight: 'פ'
      };
      notation += pieceSymbols[piece.type as keyof typeof pieceSymbols];
    }
    
    // מהלכים מיוחדים
    if (specialMove === 'castling') {
      notation = to.col === 6 ? '0-0' : '0-0-0';
    } else {
      // אכילה
      if (capturedPiece || specialMove === 'enPassant') {
        if (piece.type === 'pawn') {
          notation += String.fromCharCode(97 + from.col); // a-h
        }
        notation += 'x';
      }
      
      // משבצת יעד
      notation += String.fromCharCode(97 + to.col) + (8 - to.row);
      
      // הכתרה
      if (specialMove === 'promotion') {
        notation += '=' + (move.promotionPiece === 'queen' ? 'מל' : 
                          move.promotionPiece === 'rook' ? 'צ' :
                          move.promotionPiece === 'bishop' ? 'ר' : 'פ');
      }
    }
    
    // שח ומט
    if (isCheckmate) {
      notation += '#';
    } else if (isCheck) {
      notation += '+';
    }
    
    return notation;
  };

  const getMoveNumber = (index: number): number => Math.floor(index / 2) + 1;
  const isWhiteMove = (index: number): boolean => index % 2 === 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4 text-gray-800">היסטוריית מהלכים</h3>
      
      {moves.length === 0 ? (
        <p className="text-gray-500 text-center">עדיין לא בוצעו מהלכים</p>
      ) : (
        <div className="space-y-1">
          {moves.map((move, index) => {
            const moveNumber = getMoveNumber(index);
            const isWhite = isWhiteMove(index);
            const isCurrentMove = currentMoveIndex === index;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                  isCurrentMove 
                    ? 'bg-blue-100 border-2 border-blue-300' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => onMoveClick?.(index)}
              >
                {isWhite && (
                  <span className="w-8 text-sm font-medium text-gray-600 mr-2">
                    {moveNumber}.
                  </span>
                )}
                
                <div className={`flex-1 text-sm font-mono ${
                  isWhite ? 'text-gray-800' : 'text-gray-600 mr-8'
                }`}>
                  {formatMove(move)}
                </div>
                
                {move.capturedPiece && (
                  <div className="text-xs text-red-500">
                    {getPieceSymbol(move.capturedPiece.type)}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
      
      {moves.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            סה"כ מהלכים: {moves.length}
          </div>
        </div>
      )}
    </div>
  );
}

function getPieceSymbol(pieceType: string): string {
  const symbols = {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  };
  return symbols[pieceType as keyof typeof symbols] || '';
} 