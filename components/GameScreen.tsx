import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, DialogContent, Fab } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import Scoreboard from '@/components/Scoreboard';
import Player from '@/components/Player';
import { Box, Button } from '@mui/material';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { SafeAreaView } from 'react-native-safe-area-context';
import { canUndoAction } from '@/game/dominion-lib.undo';
import { useGameContext } from '@/components/GameContext';
import InventoryIcon from '@mui/icons-material/Inventory';
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
      <SafeAreaView style={styles.container}>
        <Scoreboard />
        <Player addLogEntry={addLogEntry} />
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={nextTurn}>
            Next Turn
          </Button>
          <Button variant="contained" color="secondary" onClick={endGame}>
            End Game
          </Button>
        </Box>
      </SafeAreaView>
      <SafeAreaView style={styles.fabContainer} edges={['bottom', 'right']}>
        <Fab
          color="secondary"
          aria-label="undo"
          style={styles.undoFab}
          onClick={undoLastAction}
          disabled={!canUndo}
        >
          <UndoIcon />
        </Fab>
        <Fab
          color="primary"
          aria-label="supply"
          style={styles.supplyFab}
          onClick={handleOpenSupplyDialog}
        >
          <InventoryIcon />
        </Fab>
      </SafeAreaView>
      <Dialog open={supplyDialogOpen} onClose={handleCloseSupplyDialog}>
        <DialogContent>
          <SupplyCounts />
        </DialogContent>
      </Dialog>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
  },
  supplyFab: {
    marginLeft: 16, // Add space between the FABs
  },
  undoFab: {
    // No additional styling needed
  },
});

export default GameScreen;
