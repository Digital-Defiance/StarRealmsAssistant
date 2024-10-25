import React, { useState, useEffect } from 'react';
import {
  formatTimeSpan,
  calculateGameDuration,
  calculateAverageTurnDurationForPlayer,
  calculateCurrentTurnDuration,
  calculateTurnDurations,
  calculateAverageTurnDuration,
} from '@/game/dominion-lib-log';
import { useGameContext } from '@/components/GameContext';
import { Typography, Box } from '@mui/material';

const GameClock = () => {
  const { gameState } = useGameContext();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const gameTimeResult = calculateGameDuration(
    gameState.log,
    calculateTurnDurations,
    calculateCurrentTurnDuration
  );
  const averageTurnTime = calculateAverageTurnDuration(gameTimeResult.turnDurations);
  const averageTurnCurrentPlayer = calculateAverageTurnDurationForPlayer(
    gameTimeResult.turnDurations,
    gameState.selectedPlayerIndex
  );
  const currentTurnTime = calculateCurrentTurnDuration(gameState.log, currentTime);

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 100,
        left: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '8px 16px',
        borderRadius: '8px',
      }}
    >
      <Typography sx={{ fontFamily: 'CharlemagneStdBold', fontSize: '1rem', color: 'white' }}>
        Game Time: {formatTimeSpan(gameTimeResult.duration)}
      </Typography>
      <Typography sx={{ fontFamily: 'CharlemagneStdBold', fontSize: '1rem', color: 'white' }}>
        Current Turn: {formatTimeSpan(currentTurnTime)}
      </Typography>
      <Typography sx={{ fontFamily: 'CharlemagneStdBold', fontSize: '1rem', color: 'white' }}>
        Average Turn: {formatTimeSpan(averageTurnTime)}
      </Typography>
      <Typography sx={{ fontFamily: 'CharlemagneStdBold', fontSize: '1rem', color: 'white' }}>
        Avg Player Turn: {formatTimeSpan(averageTurnCurrentPlayer)}
      </Typography>
    </Box>
  );
};

export default GameClock;
