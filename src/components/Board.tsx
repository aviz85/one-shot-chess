// רכיב לוח השחמט

import React from 'react';
import { useGame } from '../contexts/GameContext';
import Square from './Square';
import { BOARD_SIZE, FILE_LETTERS, RANK_NUMBERS } from '../utils/constants';

const Board: React.FC = () => {
  const { gameState, selectedPosition, possibleMoves, selectPiece, movePiece } = useGame();

  const handleSquareClick = (row: number, col: number) => {
    // אם יש כלי נבחר ולוחצים על מהלך אפשרי
    if (selectedPosition && possibleMoves.some(move => move.row === row && move.col === col)) {
      movePiece({ row, col });
    } else {
      // אחרת, בוחרים כלי חדש
      selectPiece({ row, col });
    }
  };

  const isSelected = (row: number, col: number) => {
    return selectedPosition?.row === row && selectedPosition?.col === col;
  };

  const isPossibleMove = (row: number, col: number) => {
    return possibleMoves.some(move => move.row === row && move.col === col);
  };

  const isCheck = (row: number, col: number) => {
    const piece = gameState.board[row][col];
    return piece?.type === 'king' && 
           piece.color === gameState.currentPlayer && 
           gameState.isCheck;
  };

  return (
    <div className="inline-block">
      <div className="relative p-10">
        {/* אותיות עמודות */}
        <div className="flex absolute -bottom-8 left-0 right-0 px-10">
          {FILE_LETTERS.map((letter) => (
            <div key={letter} className="w-20 h-8 flex items-center justify-center text-lg font-medium text-gray-700">
              {letter}
            </div>
          ))}
        </div>

        {/* מספרי שורות */}
        <div className="absolute -left-8 top-0 bottom-0 py-10 flex flex-col">
          {RANK_NUMBERS.map((number) => (
            <div key={number} className="w-8 h-20 flex items-center justify-center text-lg font-medium text-gray-700">
              {number}
            </div>
          ))}
        </div>

        {/* הלוח עצמו */}
        <div className="border-4 border-gray-800 shadow-2xl rounded-lg overflow-hidden">
          {Array.from({ length: BOARD_SIZE }, (_, row) => (
            <div key={row} className="flex">
              {Array.from({ length: BOARD_SIZE }, (_, col) => (
                <Square
                  key={`${row}-${col}`}
                  row={row}
                  col={col}
                  piece={gameState.board[row][col]}
                  isLight={(row + col) % 2 === 0}
                  isSelected={isSelected(row, col)}
                  isPossibleMove={isPossibleMove(row, col)}
                  isCheck={isCheck(row, col)}
                  onClick={() => handleSquareClick(row, col)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board; 