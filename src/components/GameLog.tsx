import React from 'react';
import {
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import GameLogEntry from '@/components/GameLogEntry';
import TabTitle from '@/components/TabTitle';
import { CurrentStep } from '@/game/enumerations/current-step';

const GameLog: React.FC = () => {
  const { gameState } = useGameContext();

  return (
    <>
      <TabTitle>Game Log</TabTitle>
      {gameState.currentStep === CurrentStep.GameScreen ||
      gameState.currentStep === CurrentStep.EndGame ? (
        <TableContainer component={Paper} style={{ maxHeight: 400, width: '100%' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '15%', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell style={{ width: '15%', fontWeight: 'bold' }}>Game Time</TableCell>
                <TableCell style={{ width: '60%', fontWeight: 'bold' }}>Action</TableCell>
                <TableCell style={{ width: '10%', fontWeight: 'bold' }}>Undo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gameState.log.map((entry, index) => {
                const hasLinkedAction = gameState.log.some(
                  (logEntry) => logEntry.linkedActionId === entry.id
                );
                return (
                  <GameLogEntry
                    key={entry.id || index}
                    logIndex={index}
                    entry={entry}
                    isCurrentPlayer={index === gameState.currentPlayerIndex}
                    hasLinkedAction={hasLinkedAction}
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" color="textSecondary" align="center" style={{ marginTop: 20 }}>
          The game has not started yet.
        </Typography>
      )}
    </>
  );
};

export default GameLog;
