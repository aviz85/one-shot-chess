// רכיב משבצת בלוח השחמט

import React from 'react';
import type { Piece } from '../types/chess.types';
import ChessPiece from './ChessPiece';
import { SQUARE_COLORS } from '../utils/constants';

interface SquareProps {
  row: number;
  col: number;
  piece: Piece | null;
  isLight: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
  isCheck: boolean;
  onClick: (position: { row: number; col: number }) => void;
  onDrop?: (from: { row: number; col: number }, to: { row: number; col: number }) => void;
}

const Square: React.FC<SquareProps> = ({
  row: _row,
  col: _col,
  piece,
  isLight,
  isSelected,
  isPossibleMove,
  isCheck,
  onClick,
  onDrop
}) => {
  const getBackgroundColor = () => {
    if (isCheck) return SQUARE_COLORS.check;
    if (isSelected) return SQUARE_COLORS.selected;
    return isLight ? SQUARE_COLORS.light : SQUARE_COLORS.dark;
  };

  const position = { row: _row, col: _col };

  const handleClick = () => {
    onClick(position);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (piece) {
      e.dataTransfer.setData('text/plain', JSON.stringify(position));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromPosition = JSON.parse(e.dataTransfer.getData('text/plain'));
    onDrop?.(fromPosition, position);
  };

  return (
    <div
      className="relative w-24 h-24 cursor-pointer flex items-center justify-center transition-colors duration-200"
      style={{ backgroundColor: getBackgroundColor() }}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {piece && <ChessPiece piece={piece} />}
      
      {/* נקודה לסימון מהלך אפשרי */}
      {isPossibleMove && !piece && (
        <div className="absolute w-6 h-6 bg-gray-600 bg-opacity-40 rounded-full" />
      )}
      
      {/* טבעת לסימון מהלך אפשרי עם כלי */}
      {isPossibleMove && piece && (
        <div className="absolute inset-2 border-4 border-gray-600 border-opacity-40 rounded-sm pointer-events-none" />
      )}
    </div>
  );
};

export default Square; 