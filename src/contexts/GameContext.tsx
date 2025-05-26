// Context לניהול מצב המשחק

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Position, GameSettings, GameStatus } from '../types/chess.types';
import { createNewGame, makeMove } from '../game/gameLogic';
import { getPossibleMoves } from '../game/moves';
import { getPieceAt } from '../game/board';

interface GameContextType {
  gameState: GameState;
  gameStatus: GameStatus;
  gameSettings: GameSettings;
  selectedPosition: Position | null;
  possibleMoves: Position[];
  selectPiece: (position: Position) => void;
  movePiece: (to: Position) => void;
  startNewGame: (settings?: Partial<GameSettings>) => void;
  resignGame: (player: 'white' | 'black') => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
  initialSettings?: GameSettings;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children, initialSettings }) => {
  const [gameState, setGameState] = useState<GameState>(createNewGame());
  const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');
  const [gameSettings, setGameSettings] = useState<GameSettings>(initialSettings || {
    playerNames: {
      white: 'שחקן 1',
      black: 'שחקן 2'
    }
  });
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);

  // אם יש הגדרות התחלתיות, מתחיל משחק אוטומטית
  useEffect(() => {
    if (initialSettings) {
      setGameSettings(initialSettings);
      setGameStatus('playing');
    }
  }, [initialSettings]);

  const selectPiece = useCallback((position: Position) => {
    const piece = getPieceAt(gameState.board, position);
    
    // אם בוחרים כלי של השחקן הנוכחי
    if (piece && piece.color === gameState.currentPlayer && gameStatus === 'playing') {
      setSelectedPosition(position);
      const moves = getPossibleMoves(gameState.board, position);
      setPossibleMoves(moves);
    } else {
      // אם לוחצים על משבצת ריקה או כלי של היריב, מבטלים בחירה
      setSelectedPosition(null);
      setPossibleMoves([]);
    }
  }, [gameState, gameStatus]);

  const movePiece = useCallback((to: Position) => {
    if (!selectedPosition || gameStatus !== 'playing') return;

    const newState = makeMove(gameState, selectedPosition, to);
    if (newState) {
      setGameState(newState);
      setSelectedPosition(null);
      setPossibleMoves([]);

      // בודק אם המשחק נגמר
      if (newState.isCheckmate || newState.isStalemate || newState.isDraw) {
        setGameStatus('finished');
      }
    }
  }, [gameState, selectedPosition, gameStatus]);

  const startNewGame = useCallback((settings?: Partial<GameSettings>) => {
    setGameState(createNewGame());
    setGameStatus('playing');
    setSelectedPosition(null);
    setPossibleMoves([]);
    
    if (settings) {
      setGameSettings(prev => ({ ...prev, ...settings }));
    }
  }, []);

  const resignGame = useCallback((_player: 'white' | 'black') => {
    setGameStatus('finished');
    // TODO: הוסף לוגיקה לשמירת תוצאת המשחק
  }, []);

  const value: GameContextType = {
    gameState,
    gameStatus,
    gameSettings,
    selectedPosition,
    possibleMoves,
    selectPiece,
    movePiece,
    startNewGame,
    resignGame
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}; 