import React from 'react';
import { Typography, Paper, TableContainer, Table, TableBody } from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import GameLogEntry from '@/components/GameLogEntry';

const GameLog: React.FC = () => {
  const { gameState, setGameState } = useGameContext();
  return (
    <Paper elevation={3} style={{ padding: '16px', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Game Log
      </Typography>
      <TableContainer component={Paper} style={{ maxHeight: 400, width: '100%' }}>
        <Table stickyHeader style={{ width: '100%' }}>
          <TableBody>
            {gameState.log.map((entry, index) => (
              <GameLogEntry game={gameState} key={index} entry={entry} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default GameLog;
