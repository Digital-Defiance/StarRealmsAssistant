import React, { useState } from 'react';
import {
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import GameLogEntry from '@/components/GameLogEntry';
import TabTitle from '@/components/TabTitle';
import { CurrentStep } from '@/game/enumerations/current-step';
import TurnAdjustmentsSummary from '@/components/TurnAdjustments';

const GameLog: React.FC = () => {
  const { gameState } = useGameContext();
  const [openTurnAdjustmentsDialog, setOpenTurnAdjustmentsDialog] = useState(false);
  const [selectedTurn, setSelectedTurn] = useState<number | null>(null);

  const handleOpenTurnAdjustmentsDialog = (turn: number) => {
    setSelectedTurn(turn);
    setOpenTurnAdjustmentsDialog(true);
  };

  const handleCloseTurnAdjustmentsDialog = () => {
    setOpenTurnAdjustmentsDialog(false);
    setSelectedTurn(null);
  };

  return (
    <>
      <Box display="flex" justifyContent="center" sx={{ paddingTop: 4 }}>
        <TabTitle>Game Log</TabTitle>
      </Box>
      {gameState.currentStep === CurrentStep.Game ||
      gameState.currentStep === CurrentStep.EndGame ? (
        <TableContainer component={Paper} style={{ width: '100%' }}>
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
                return (
                  <GameLogEntry
                    key={entry.id || index}
                    logIndex={index}
                    entry={entry}
                    onOpenTurnAdjustmentsDialog={handleOpenTurnAdjustmentsDialog}
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
      <Dialog
        open={openTurnAdjustmentsDialog}
        onClose={handleCloseTurnAdjustmentsDialog}
        aria-labelledby="turn-adjustments-dialog-title"
      >
        <DialogContent>
          {selectedTurn !== null && <TurnAdjustmentsSummary turn={selectedTurn} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameLog;
