// רכיב המשחק הראשי

import React from 'react';
import { useGame } from '../contexts/GameContext';
import Board from './Board';
import GameInfo from './GameInfo';
import GameControls from './GameControls';
import GameOver from './GameOver';
import CountdownClock from './CountdownClock';

interface GameProps {
  onBackToMenu?: () => void;
}

const Game: React.FC<GameProps> = ({ onBackToMenu }) => {
  const { gameState, gameStatus, gameSettings, startNewGame } = useGame();

  const handleNewGame = () => {
    startNewGame();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* לוח השחמט */}
            <div className="flex-1 flex justify-center">
              <Board />
            </div>

            {/* פאנל מידע ובקרה */}
            <div className="w-full lg:w-96 space-y-4">
              {/* מידע על המשחק */}
              <GameInfo />
              
              {/* שעון ספירה לאחור */}
              <CountdownClock />
              
              {/* בקרות משחק */}
              <GameControls onBackToMenu={onBackToMenu} />
              
              {/* הודעות מצב */}
              {gameState.isCheck && !gameState.isCheckmate && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                  <strong>שח!</strong> המלך בסכנה
                </div>
              )}
              
              {gameState.isCheckmate && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <strong>מט!</strong> {gameState.currentPlayer === 'white' ? 'שחור' : 'לבן'} ניצח!
                </div>
              )}
              
              {gameState.isStalemate && (
                <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
                  <strong>פט!</strong> המשחק הסתיים בתיקו
                </div>
              )}
              
              {gameState.isDraw && !gameState.isStalemate && (
                <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
                  <strong>תיקו!</strong> המשחק הסתיים בתיקו
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* מסך סיום משחק */}
      {gameStatus === 'finished' && (
        <GameOver 
          onNewGame={handleNewGame}
          onBackToMenu={onBackToMenu || (() => {})}
        />
      )}
    </>
  );
};

export default Game; 