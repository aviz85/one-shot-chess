import { useState } from 'react';
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
