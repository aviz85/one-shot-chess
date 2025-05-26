import type { GameState, SavedGame, GameSettings } from '../types/chess.types';

const STORAGE_KEY = 'chess_saved_games';
const AUTO_SAVE_KEY = 'chess_auto_save';

/**
 * שומר משחק ב-localStorage
 */
export function saveGame(gameState: GameState, settings: GameSettings, name?: string): string {
  const savedGames = getSavedGames();
  
  const gameId = generateGameId();
  const savedGame: SavedGame = {
    id: gameId,
    name: name || `משחק ${new Date().toLocaleDateString('he-IL')}`,
    gameState,
    settings,
    createdAt: new Date(),
    lastModified: new Date()
  };
  
  savedGames.push(savedGame);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGames));
  
  return gameId;
}

/**
 * טוען משחק לפי ID
 */
export function loadGame(gameId: string): SavedGame | null {
  const savedGames = getSavedGames();
  return savedGames.find(game => game.id === gameId) || null;
}

/**
 * מחזיר את כל המשחקים השמורים
 */
export function getSavedGames(): SavedGame[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    const games = JSON.parse(saved);
    // המרת תאריכים מחזרה לאובייקטי Date
    return games.map((game: SavedGame & { createdAt: string; lastModified: string }) => ({
      ...game,
      createdAt: new Date(game.createdAt),
      lastModified: new Date(game.lastModified)
    }));
  } catch (error) {
    console.error('שגיאה בטעינת משחקים שמורים:', error);
    return [];
  }
}

/**
 * מוחק משחק שמור
 */
export function deleteGame(gameId: string): boolean {
  try {
    const savedGames = getSavedGames();
    const filteredGames = savedGames.filter(game => game.id !== gameId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredGames));
    return true;
  } catch (error) {
    console.error('שגיאה במחיקת משחק:', error);
    return false;
  }
}

/**
 * מעדכן משחק קיים
 */
export function updateGame(gameId: string, gameState: GameState, settings: GameSettings): boolean {
  try {
    const savedGames = getSavedGames();
    const gameIndex = savedGames.findIndex(game => game.id === gameId);
    
    if (gameIndex === -1) return false;
    
    savedGames[gameIndex] = {
      ...savedGames[gameIndex],
      gameState,
      settings,
      lastModified: new Date()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGames));
    return true;
  } catch (error) {
    console.error('שגיאה בעדכון משחק:', error);
    return false;
  }
}

/**
 * שמירה אוטומטית
 */
export function autoSave(gameState: GameState, settings: GameSettings): void {
  try {
    const autoSaveData = {
      gameState,
      settings,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(autoSaveData));
  } catch (error) {
    console.error('שגיאה בשמירה אוטומטית:', error);
  }
}

/**
 * טעינת שמירה אוטומטית
 */
export function loadAutoSave(): { gameState: GameState; settings: GameSettings } | null {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    if (!saved) return null;
    
    const data = JSON.parse(saved);
    return {
      gameState: data.gameState,
      settings: data.settings
    };
  } catch (error) {
    console.error('שגיאה בטעינת שמירה אוטומטית:', error);
    return null;
  }
}

/**
 * מחיקת שמירה אוטומטית
 */
export function clearAutoSave(): void {
  localStorage.removeItem(AUTO_SAVE_KEY);
}

/**
 * ייצוא משחק לקובץ JSON
 */
export function exportGame(gameState: GameState, settings: GameSettings): string {
  const exportData = {
    gameState,
    settings,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * ייבוא משחק מקובץ JSON
 */
export function importGame(jsonData: string): { gameState: GameState; settings: GameSettings } | null {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.gameState || !data.settings) {
      throw new Error('פורמט קובץ לא תקין');
    }
    
    return {
      gameState: data.gameState,
      settings: data.settings
    };
  } catch (error) {
    console.error('שגיאה בייבוא משחק:', error);
    return null;
  }
}

/**
 * יוצר ID ייחודי למשחק
 */
function generateGameId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * בדיקת תמיכה ב-localStorage
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
} 