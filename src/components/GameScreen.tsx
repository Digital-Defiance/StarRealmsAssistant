import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  styled,
  Tooltip,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import InventoryIcon from '@mui/icons-material/Inventory';
import Scoreboard from '@/components/Scoreboard';
import Player from '@/components/Player';
import { canUndoAction } from '@/game/dominion-lib-undo';
import { useGameContext } from '@/components/GameContext';
import SupplyCounts from '@/components/SupplyCounts';
import GameClock from '@/components/GameClock';
import { CurrentStep } from '@/game/enumerations/current-step';

interface GameScreenProps {
  nextTurn: () => void;
  endGame: () => void;
  undoLastAction: () => void;
}

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  height: '100vh',
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const FabContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(10),
  right: theme.spacing(2),
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
}));

const GameScreen: React.FC<GameScreenProps> = ({ nextTurn, endGame, undoLastAction }) => {
  const { gameState } = useGameContext();
  const [canUndo, setCanUndo] = useState(false);
  const [supplyDialogOpen, setSupplyDialogOpen] = useState(false);
  const [confirmEndGameDialogOpen, setConfirmEndGameDialogOpen] = useState(false);

  useEffect(() => {
    setCanUndo(canUndoAction(gameState, gameState.log.length - 1));
  }, [gameState]);

  const handleOpenSupplyDialog = () => {
    setSupplyDialogOpen(true);
  };

  const handleCloseSupplyDialog = () => {
    setSupplyDialogOpen(false);
  };

  const handleOpenConfirmEndGameDialog = () => {
    setConfirmEndGameDialogOpen(true);
  };

  const handleCloseConfirmEndGameDialog = () => {
    setConfirmEndGameDialogOpen(false);
  };

  const handleConfirmEndGame = () => {
    setConfirmEndGameDialogOpen(false);
    endGame();
  };

  return (
    <>
      <Container>
        <Scoreboard />
        <Player />
        <ButtonContainer>
          <Button variant="contained" color="primary" onClick={nextTurn}>
            Next Turn
          </Button>
          <Button variant="contained" color="secondary" onClick={handleOpenConfirmEndGameDialog}>
            End Game
          </Button>
        </ButtonContainer>
      </Container>
      <FabContainer>
        <Fab color="secondary" aria-label="undo" onClick={undoLastAction} disabled={!canUndo}>
          <Tooltip title="Undo the most recent update">
            <UndoIcon />
          </Tooltip>
        </Fab>
        <Fab color="primary" aria-label="supply" onClick={handleOpenSupplyDialog}>
          <Tooltip title="Show victory kingdom card supply counts">
            <InventoryIcon />
          </Tooltip>
        </Fab>
      </FabContainer>
      {gameState.currentStep === CurrentStep.GameScreen && <GameClock />}
      <Dialog open={supplyDialogOpen} onClose={handleCloseSupplyDialog}>
        <DialogContent>
          <SupplyCounts />
        </DialogContent>
      </Dialog>
      <Dialog open={confirmEndGameDialogOpen} onClose={handleCloseConfirmEndGameDialog}>
        <DialogTitle>Confirm End Game</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to end the game?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmEndGameDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmEndGame} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GameScreen;
