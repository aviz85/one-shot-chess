// רכיב כלי שחמט

import React from 'react';
import type { Piece } from '../types/chess.types';
import { PIECE_SYMBOLS } from '../utils/constants';

interface ChessPieceProps {
  piece: Piece;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece }) => {
  const symbol = PIECE_SYMBOLS[piece.color][piece.type];

  return (
    <div
      className="text-6xl select-none cursor-pointer"
      style={{
        filter: piece.color === 'white' 
          ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))' 
          : 'drop-shadow(1px 1px 2px rgba(255,255,255,0.3))'
      }}
    >
      {symbol}
    </div>
  );
};

export default ChessPiece; 