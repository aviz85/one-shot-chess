// רכיב תפריט ראשי

import React, { useState } from 'react';
import type { GameSettings } from '../types/chess.types';

interface MainMenuProps {
  onStartGame: (settings: GameSettings) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [playerNames, setPlayerNames] = useState({
    white: 'שחקן 1',
    black: 'שחקן 2'
  });

  const handleStartGame = () => {
    onStartGame({
      playerNames
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          משחק שחמט
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שם שחקן לבן
            </label>
            <input
              type="text"
              value={playerNames.white}
              onChange={(e) => setPlayerNames({ ...playerNames, white: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="הכנס שם שחקן"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שם שחקן שחור
            </label>
            <input
              type="text"
              value={playerNames.black}
              onChange={(e) => setPlayerNames({ ...playerNames, black: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="הכנס שם שחקן"
            />
          </div>

          <button
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            התחל משחק
          </button>

          <div className="text-center text-sm text-gray-500 mt-4">
            <p>משחק שחמט קלאסי לשני שחקנים</p>
            <p className="mt-2 text-2xl">♔ ♕ ♖ ♗ ♘ ♙</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu; 