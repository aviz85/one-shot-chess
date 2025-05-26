import { motion } from 'framer-motion';
import type { PieceType, PlayerColor } from '../types/chess.types';

interface PromotionDialogProps {
  color: PlayerColor;
  onSelect: (pieceType: PieceType) => void;
  onCancel: () => void;
}

export default function PromotionDialog({ color, onSelect, onCancel }: PromotionDialogProps) {
  const pieces: { type: PieceType; name: string; symbol: string }[] = [
    { type: 'queen', name: 'מלכה', symbol: color === 'white' ? '♕' : '♛' },
    { type: 'rook', name: 'צריח', symbol: color === 'white' ? '♖' : '♜' },
    { type: 'bishop', name: 'רץ', symbol: color === 'white' ? '♗' : '♝' },
    { type: 'knight', name: 'פרש', symbol: color === 'white' ? '♘' : '♞' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          בחר כלי להכתרה
        </h3>
        
        <p className="text-gray-600 text-center mb-6">
          הרגלי הגיע לקצה הלוח. בחר באיזה כלי להחליפו:
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {pieces.map((piece) => (
            <motion.button
              key={piece.type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(piece.type)}
              className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-4xl mb-2">{piece.symbol}</div>
              <div className="text-sm font-medium text-gray-700">{piece.name}</div>
            </motion.button>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ביטול
          </button>
        </div>
      </motion.div>
    </div>
  );
} 