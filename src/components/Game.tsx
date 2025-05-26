// רכיב המשחק הראשי

import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import Board from './Board';
import GameInfo from './GameInfo';
import GameControls from './GameControls';
import GameOver from './GameOver';
import CountdownClock from './CountdownClock';
import MoveHistory from './MoveHistory';
import SavedGames from './SavedGames';

interface GameProps {
  onBackToMenu?: () => void;
}

const Game: React.FC<GameProps> = ({ onBackToMenu }) => {
  const { gameState, gameStatus, startNewGame, loadGame, gameSettings } = useGame();
  const [showMoveHistory, setShowMoveHistory] = useState(true);
  const [showSavedGames, setShowSavedGames] = useState(false);

  const handleNewGame = () => {
    startNewGame();
  };

  const handleMoveClick = (moveIndex: number) => {
    // TODO: הוסף פונקציונליות לחזרה למהלך מסוים
    console.log('Clicked on move:', moveIndex);
  };

  const handleLoadGame = (gameState: any, settings: any) => {
    loadGame(gameState, settings);
    setShowSavedGames(false);
  };

  const handleCloseSavedGames = () => {
    setShowSavedGames(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col xl:flex-row gap-8 items-start">
            {/* לוח השחמט */}
            <div className="flex-1 flex justify-center">
              <Board />
            </div>

            {/* פאנל מידע ובקרה */}
            <div className="w-full xl:w-96 space-y-4">
              {/* מידע על המשחק */}
              <GameInfo />
              
              {/* שעון ספירה לאחור */}
              <CountdownClock />
              
              {/* בקרות משחק */}
              <GameControls onBackToMenu={onBackToMenu} />
              
              {/* כפתורי תצוגה */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMoveHistory(!showMoveHistory)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    showMoveHistory 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {showMoveHistory ? 'הסתר' : 'הצג'} היסטוריה
                </button>
                <button
                  onClick={() => setShowSavedGames(!showSavedGames)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    showSavedGames 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {showSavedGames ? 'הסתר' : 'הצג'} משחקים שמורים
                </button>
              </div>
              
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

            {/* פאנל צדדי נוסף להיסטוריה ומשחקים שמורים */}
            {(showMoveHistory || showSavedGames) && (
              <div className="w-full xl:w-80 space-y-4">
                {/* היסטוריית מהלכים */}
                {showMoveHistory && (
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">היסטוריית מהלכים</h3>
                    </div>
                    <div className="p-4">
                      <MoveHistory 
                        moves={gameState.moves}
                        onMoveClick={handleMoveClick}
                        currentMoveIndex={gameState.moves.length - 1}
                      />
                    </div>
                  </div>
                )}

                {/* משחקים שמורים */}
                {showSavedGames && (
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">משחקים שמורים</h3>
                    </div>
                    <div className="p-4">
                      <SavedGames 
                        onLoadGame={handleLoadGame}
                        onClose={handleCloseSavedGames}
                        currentGameState={gameState}
                        currentSettings={gameSettings}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
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