import React, { useState, useEffect } from 'react';
import {
  calculateAverageTurnDuration,
  calculateAverageTurnDurationForPlayer,
  calculateCurrentTurnDuration,
  calculateDurationUpToEvent,
  calculateTurnDurations,
  formatTimeSpan,
} from '@/game/starrealms-lib-log';
import { useGameContext } from '@/components/GameContext';
import { Typography, Box } from '@mui/material';
import { CurrentStep } from '@/game/enumerations/current-step';

const GameClock = () => {
  const { gameState } = useGameContext();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => { clearInterval(interval); };
  }, []);

  const gameTime = calculateDurationUpToEvent(gameState.log, currentTime);
  const turnDurations = calculateTurnDurations(gameState.log);
  const averageTurnTime = calculateAverageTurnDuration(turnDurations);
  const averageTurnCurrentPlayer = calculateAverageTurnDurationForPlayer(
    turnDurations,
    gameState.selectedPlayerIndex
  );
  const currentTurnTime = calculateCurrentTurnDuration(gameState.log, currentTime);

  if (gameState.currentStep !== CurrentStep.Game) {
    return null;
  }

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
      <Typography sx={{ fontFamily: 'Handel Gothic ITC Pro', fontSize: '1rem', color: 'white' }}>
        Game Time: {formatTimeSpan(gameTime)}
      </Typography>
      <Typography sx={{ fontFamily: 'Handel Gothic ITC Pro', fontSize: '1rem', color: 'white' }}>
        Current Turn: {formatTimeSpan(currentTurnTime)}
      </Typography>
      <Typography sx={{ fontFamily: 'Handel Gothic ITC Pro', fontSize: '1rem', color: 'white' }}>
        Average Turn: {formatTimeSpan(averageTurnTime)}
      </Typography>
      <Typography sx={{ fontFamily: 'Handel Gothic ITC Pro', fontSize: '1rem', color: 'white' }}>
        Avg Player Turn: {formatTimeSpan(averageTurnCurrentPlayer)}
      </Typography>
    </Box>
  );
};

export default GameClock;
