// רכיב בקרות משחק

import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { saveGame } from '../utils/gameStorage';

interface GameControlsProps {
  onBackToMenu?: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ onBackToMenu }) => {
  const { gameStatus, startNewGame, resignGame, gameState, gameSettings } = useGame();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

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

  const handleSaveGame = () => {
    const name = saveName.trim() || `משחק ${new Date().toLocaleDateString('he-IL')}`;
    saveGame(gameState, gameSettings, name);
    setSaveName('');
    setShowSaveDialog(false);
    alert('המשחק נשמר בהצלחה!');
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

        {/* כפתור שמירת משחק */}
        {(gameStatus === 'playing' || gameStatus === 'finished') && gameState.moves.length > 0 && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            שמור משחק
          </button>
        )}

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

      {/* דיאלוג שמירת משחק */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">שמור משחק</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="שם המשחק (אופציונלי)"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveGame}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                שמור
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls; 