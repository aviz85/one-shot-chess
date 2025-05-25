// רכיב מידע על המשחק

import React from 'react';
import { useGame } from '../contexts/GameContext';
import { PIECE_SYMBOLS } from '../utils/constants';

const GameInfo: React.FC = () => {
  const { gameState, gameSettings } = useGame();

  const getCurrentPlayerName = () => {
    return gameSettings.playerNames[gameState.currentPlayer];
  };

  const getCurrentPlayerSymbol = () => {
    return gameState.currentPlayer === 'white' ? '♔' : '♚';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">מידע על המשחק</h2>
      
      {/* תור נוכחי */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">תור נוכחי</h3>
        <div className="flex items-center gap-2 text-xl">
          <span className="text-3xl">{getCurrentPlayerSymbol()}</span>
          <span>{getCurrentPlayerName()}</span>
          <span className="text-sm text-gray-500">
            ({gameState.currentPlayer === 'white' ? 'לבן' : 'שחור'})
          </span>
        </div>
      </div>

      {/* מהלך מספר */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">מהלך מספר</h3>
        <span className="text-xl">{gameState.fullMoveNumber}</span>
      </div>

      {/* כלים שנאכלו */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">כלים שנאכלו</h3>
        
        <div className="mb-2">
          <span className="text-sm text-gray-600">לבן איבד:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {gameState.capturedPieces.white.map((piece, index) => (
              <span key={index} className="text-2xl">
                {PIECE_SYMBOLS.white[piece.type]}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm text-gray-600">שחור איבד:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {gameState.capturedPieces.black.map((piece, index) => (
              <span key={index} className="text-2xl">
                {PIECE_SYMBOLS.black[piece.type]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInfo; 