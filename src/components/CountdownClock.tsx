// רכיב שעון ספירה לאחור

import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

interface CountdownClockProps {
  initialTime?: number; // זמן התחלתי בשניות (ברירת מחדל: 10 דקות)
}

const CountdownClock: React.FC<CountdownClockProps> = ({ initialTime = 600 }) => {
  const { gameState, gameStatus } = useGame();
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const interval = setInterval(() => {
      if (gameState.currentPlayer === 'white') {
        setWhiteTime(prev => Math.max(0, prev - 1));
      } else {
        setBlackTime(prev => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStatus, gameState.currentPlayer]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (time: number, isActive: boolean): string => {
    if (time <= 30) return 'text-red-600';
    if (time <= 60) return 'text-orange-500';
    if (isActive) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">שעון משחק</h2>
      
      <div className="space-y-4">
        {/* שעון שחקן שחור */}
        <div className={`p-4 rounded-lg border-2 ${
          gameState.currentPlayer === 'black' && gameStatus === 'playing' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">שחור</span>
            <div className={`text-3xl font-mono font-bold ${
              getTimeColor(blackTime, gameState.currentPlayer === 'black' && gameStatus === 'playing')
            }`}>
              {formatTime(blackTime)}
            </div>
          </div>
          {blackTime === 0 && (
            <div className="text-red-600 text-sm mt-1">זמן נגמר!</div>
          )}
        </div>

        {/* שעון שחקן לבן */}
        <div className={`p-4 rounded-lg border-2 ${
          gameState.currentPlayer === 'white' && gameStatus === 'playing' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">לבן</span>
            <div className={`text-3xl font-mono font-bold ${
              getTimeColor(whiteTime, gameState.currentPlayer === 'white' && gameStatus === 'playing')
            }`}>
              {formatTime(whiteTime)}
            </div>
          </div>
          {whiteTime === 0 && (
            <div className="text-red-600 text-sm mt-1">זמן נגמר!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountdownClock; 