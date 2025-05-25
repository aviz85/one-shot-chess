// רכיב מסך סיום משחק

import React from 'react';
import { useGame } from '../contexts/GameContext';

interface GameOverProps {
  onNewGame: () => void;
  onBackToMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ onNewGame, onBackToMenu }) => {
  const { gameState, gameSettings } = useGame();

  const getWinner = () => {
    if (gameState.isCheckmate) {
      const winner = gameState.currentPlayer === 'white' ? 'black' : 'white';
      return gameSettings.playerNames[winner];
    }
    return null;
  };

  const getResultMessage = () => {
    if (gameState.isCheckmate) {
      return `${getWinner()} ניצח במט!`;
    }
    if (gameState.isStalemate) {
      return 'המשחק הסתיים בפט!';
    }
    if (gameState.isDraw) {
      return 'המשחק הסתיים בתיקו!';
    }
    return 'המשחק הסתיים';
  };

  const getResultIcon = () => {
    if (gameState.isCheckmate) {
      return '👑';
    }
    return '🤝';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">{getResultIcon()}</div>
        
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          {getResultMessage()}
        </h2>

        <div className="mb-6 text-gray-600">
          <p>מהלכים: {gameState.moves.length}</p>
          <p>זמן משחק: {gameState.fullMoveNumber} סיבובים</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onNewGame}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            משחק חדש
          </button>

          <button
            onClick={onBackToMenu}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            חזרה לתפריט הראשי
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver; 