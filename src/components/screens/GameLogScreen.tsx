import React from 'react';
import { Box } from '@mui/material';
import GameLog from '@/components/GameLog';

export default function GameLogScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        height: '100%',
      }}
    >
      <GameLog />
    </Box>
  );
}
