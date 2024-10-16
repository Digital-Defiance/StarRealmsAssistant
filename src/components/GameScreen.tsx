import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogContent, 
  Fab, 
  styled 
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import InventoryIcon from '@mui/icons-material/Inventory';
import Scoreboard from '@/components/Scoreboard';
import Player from '@/components/Player';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { canUndoAction } from '@/game/dominion-lib-undo';
import { useGameContext } from '@/components/GameContext';
import SupplyCounts from '@/components/SupplyCounts';

interface GameScreenProps {
  nextTurn: () => void;
  endGame: () => void;
  addLogEntry: (
    playerIndex: number,
    action: GameLogActionWithCount,
    count?: number,
    correction?: boolean,
    linkedAction?: string
  ) => ILogEntry;
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
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
}));

const GameScreen: React.FC<GameScreenProps> = ({
  nextTurn,
  endGame,
  addLogEntry,
  undoLastAction,
}) => {
  const { gameState } = useGameContext();
  const [canUndo, setCanUndo] = useState(false);
  const [supplyDialogOpen, setSupplyDialogOpen] = useState(false);

  useEffect(() => {
    setCanUndo(canUndoAction(gameState, gameState.log.length - 1));
  }, [gameState]);

  const handleOpenSupplyDialog = () => {
    setSupplyDialogOpen(true);
  };

  const handleCloseSupplyDialog = () => {
    setSupplyDialogOpen(false);
  };

  return (
    <>
      <Container>
        <Scoreboard />
        <Player addLogEntry={addLogEntry} />
        <ButtonContainer>
          <Button variant="contained" color="primary" onClick={nextTurn}>
            Next Turn
          </Button>
          <Button variant="contained" color="secondary" onClick={endGame}>
            End Game
          </Button>
        </ButtonContainer>
      </Container>
      <FabContainer>
        <Fab
          color="secondary"
          aria-label="undo"
          onClick={undoLastAction}
          disabled={!canUndo}
        >
          <UndoIcon />
        </Fab>
        <Fab
          color="primary"
          aria-label="supply"
          onClick={handleOpenSupplyDialog}
        >
          <InventoryIcon />
        </Fab>
      </FabContainer>
      <Dialog open={supplyDialogOpen} onClose={handleCloseSupplyDialog}>
        <DialogContent>
          <SupplyCounts />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameScreen;