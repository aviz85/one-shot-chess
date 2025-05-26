// רכיב בקרות משחק

import React from 'react';
import { useGame } from '../contexts/GameContext';

interface GameControlsProps {
  onBackToMenu?: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ onBackToMenu }) => {
  const { gameStatus, startNewGame, resignGame, gameState } = useGame();

  const handleNewGame = () => {
    if (gameStatus === 'playing') {
      if (confirm('האם אתה בטוח שברצונך להתחיל משחק חדש?')) {
        startNewGame();
      }
    } else {
      startNewGame();
    }
  };

  const handleResign = () => {
    if (gameStatus === 'playing') {
      if (confirm(`האם אתה בטוח שברצונך לוותר? ${gameState.currentPlayer === 'white' ? 'שחור' : 'לבן'} ינצח!`)) {
        resignGame(gameState.currentPlayer);
      }
    }
  };

  const handleBackToMenu = () => {
    if (gameStatus === 'playing') {
      if (confirm('האם אתה בטוח שברצונך לחזור לתפריט הראשי? המשחק הנוכחי יאבד.')) {
        onBackToMenu?.();
      }
    } else {
      onBackToMenu?.();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">בקרות משחק</h2>
      
      <div className="flex flex-col gap-3">
        {/* כפתור משחק חדש */}
        <button
          onClick={handleNewGame}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {gameStatus === 'waiting' ? 'התחל משחק' : 'משחק חדש'}
        </button>

        {/* כפתור כניעה */}
        {gameStatus === 'playing' && (
          <button
            onClick={handleResign}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            כניעה
          </button>
        )}

        {/* כפתור חזרה לתפריט */}
        {onBackToMenu && (
          <button
            onClick={handleBackToMenu}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            חזרה לתפריט הראשי
          </button>
        )}
      </div>
    </div>
  );
};

export default GameControls; 