import React, { useState } from 'react';
import { GameProvider } from './contexts/GameContext';
import Game from './components/Game';
import MainMenu from './components/MainMenu';
import type { GameSettings } from './types/chess.types';

function App() {
  const [showMenu, setShowMenu] = useState(true);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);

  const handleStartGame = (settings: GameSettings) => {
    setGameSettings(settings);
    setShowMenu(false);
  };

  const handleBackToMenu = () => {
    setShowMenu(true);
  };

  // בדיקת Tailwind
  if (false) {
    return (
      <div className="min-h-screen bg-blue-500 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Tailwind CSS Works!</h1>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Test Button
          </button>
        </div>
      </div>
    );
  }

  if (showMenu) {
    return <MainMenu onStartGame={handleStartGame} />;
  }

  return (
    <GameProvider initialSettings={gameSettings || undefined}>
      <div className="min-h-screen bg-gray-100">
        <Game onBackToMenu={handleBackToMenu} />
      </div>
    </GameProvider>
  );
}

export default App;
