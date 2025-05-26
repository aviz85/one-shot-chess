import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavedGame, GameState, GameSettings } from '../types/chess.types';
import { getSavedGames, deleteGame, saveGame, exportGame, importGame } from '../utils/gameStorage';

interface SavedGamesProps {
  onLoadGame: (gameState: GameState, settings: GameSettings) => void;
  onClose: () => void;
  currentGameState?: GameState;
  currentSettings?: GameSettings;
}

export default function SavedGames({ onLoadGame, onClose, currentGameState, currentSettings }: SavedGamesProps) {
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    loadSavedGames();
  }, []);

  const loadSavedGames = () => {
    setSavedGames(getSavedGames());
  };

  const handleLoadGame = (game: SavedGame) => {
    onLoadGame(game.gameState, game.settings);
    onClose();
  };

  const handleDeleteGame = (gameId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את המשחק?')) {
      deleteGame(gameId);
      loadSavedGames();
    }
  };

  const handleSaveCurrentGame = () => {
    if (!currentGameState || !currentSettings) return;
    
    const name = saveName.trim() || `משחק ${new Date().toLocaleDateString('he-IL')}`;
    saveGame(currentGameState, currentSettings, name);
    setSaveName('');
    setShowSaveDialog(false);
    loadSavedGames();
  };

  const handleExportGame = (game: SavedGame) => {
    const jsonData = exportGame(game.gameState, game.settings);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportGame = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const imported = importGame(content);
      
      if (imported) {
        const name = file.name.replace('.json', '') || 'משחק מיובא';
        saveGame(imported.gameState, imported.settings, name);
        loadSavedGames();
      } else {
        alert('שגיאה בייבוא הקובץ. אנא בדוק שהקובץ תקין.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getGameStatus = (gameState: GameState): string => {
    if (gameState.isCheckmate) return 'מט';
    if (gameState.isStalemate) return 'פט';
    if (gameState.isDraw) return 'תיקו';
    if (gameState.isCheck) return 'שח';
    return 'פעיל';
  };

  const getStatusColor = (gameState: GameState): string => {
    if (gameState.isCheckmate) return 'text-red-600';
    if (gameState.isStalemate || gameState.isDraw) return 'text-yellow-600';
    if (gameState.isCheck) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">משחקים שמורים</h2>
            <div className="flex gap-2">
              {currentGameState && currentSettings && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  שמור משחק נוכחי
                </button>
              )}
              <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                ייבא משחק
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportGame}
                  className="hidden"
                />
              </label>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                סגור
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {savedGames.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">אין משחקים שמורים</p>
              <p className="text-gray-400 mt-2">שמור משחק כדי להתחיל</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedGames.map((game) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {game.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">שחקנים:</span>
                          <div>{game.settings.playerNames.white} נגד {game.settings.playerNames.black}</div>
                        </div>
                        <div>
                          <span className="font-medium">סטטוס:</span>
                          <span className={`ml-2 font-medium ${getStatusColor(game.gameState)}`}>
                            {getGameStatus(game.gameState)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">מהלכים:</span> {game.gameState.moves.length}
                        </div>
                        <div>
                          <span className="font-medium">תור:</span> {game.gameState.currentPlayer === 'white' ? 'לבן' : 'שחור'}
                        </div>
                        <div>
                          <span className="font-medium">נוצר:</span> {formatDate(game.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">עודכן:</span> {formatDate(game.lastModified)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleLoadGame(game)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        טען
                      </button>
                      <button
                        onClick={() => handleExportGame(game)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        ייצא
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        מחק
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">שמור משחק</h3>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="שם המשחק (אופציונלי)"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSaveCurrentGame}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  שמור
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 