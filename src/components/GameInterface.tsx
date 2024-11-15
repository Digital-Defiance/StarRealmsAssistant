import React, { FC, SyntheticEvent, useEffect, useRef, useState } from 'react';
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
  Tab,
  Tabs,
  Tooltip,
} from '@mui/material';
import {
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Undo as UndoIcon,
  SkipNext as NextTurnIcon,
  Stop as EndGameIcon,
} from '@mui/icons-material';
import Scoreboard from '@/components/Scoreboard';
import Player from '@/components/Player';
import { canUndoAction } from '@/game/starrealms-lib-undo';
import { useGameContext } from '@/components/GameContext';
import SupplyCounts from '@/components/SupplyCounts';
import GameClock from '@/components/GameClock';
import { CurrentStep } from '@/game/enumerations/current-step';
import { addLogEntry } from '@/game/starrealms-lib-log';
import { NO_PLAYER } from '@/game/constants';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';
import TurnAdjustmentsSummary from '@/components/TurnAdjustments';
import FloatingCounter from '@/components/FloatingCounter';
import ForwardRefBox from '@/components/ForwardRefBox';

interface GameInterfaceProps {
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
  minHeight: '70vh',
  marginTop: 0,
  paddingTop: 0,
}));

const FabContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(10),
  right: theme.spacing(2),
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
}));

const GameInterface: FC<GameInterfaceProps> = ({ nextTurn, endGame, undoLastAction }) => {
  const { gameState, setGameState } = useGameContext();
  const [canUndo, setCanUndo] = useState(false);
  const [confirmEndGameDialogOpen, setConfirmEndGameDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const viewBoxRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    setCanUndo(canUndoAction(gameState, gameState.log.length - 1));
  }, [gameState]);

  useEffect(() => {
    const handleResize = () => {
      if (viewBoxRef.current) {
        const rect = viewBoxRef.current.getBoundingClientRect();
        const style = getComputedStyle(viewBoxRef.current);
        const marginTop = parseFloat(style.marginTop) || 0;
        const marginBottom = parseFloat(style.marginBottom) || 0;
        const paddingTop = parseFloat(style.paddingTop) || 0;
        const paddingBottom = parseFloat(style.paddingBottom) || 0;
        const marginLeft = parseFloat(style.marginLeft) || 0;
        const marginRight = parseFloat(style.marginRight) || 0;
        const paddingLeft = parseFloat(style.paddingLeft) || 0;
        const paddingRight = parseFloat(style.paddingRight) || 0;

        const totalVerticalMargin = marginTop + marginBottom;
        const totalVerticalPadding = paddingTop + paddingBottom;
        const totalHorizontalMargin = marginLeft + marginRight;
        const totalHorizontalPadding = paddingLeft + paddingRight;

        setContainerHeight(rect.height - totalVerticalMargin - totalVerticalPadding);
        setContainerWidth(rect.width - totalHorizontalMargin - totalHorizontalPadding);
      }
    };

    handleResize(); // Initial calculation
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const lastAction =
    gameState.log.length > 0 ? gameState.log[gameState.log.length - 1].action : null;
  const lastActionIsPause = lastAction === GameLogAction.PAUSE;
  const lastActionIsNotPause = lastAction !== GameLogAction.PAUSE;

  const handlePauseUnpause = () => {
    if (lastActionIsPause) {
      // Unpause the game
      setGameState((prevState) => {
        const newState = deepClone<IGame>(prevState);
        const lastLogEntry = newState.log[newState.log.length - 1];
        if (lastLogEntry.action !== GameLogAction.PAUSE) {
          return prevState;
        }
        addLogEntry(newState, NO_PLAYER, GameLogAction.UNPAUSE, {
          gameTime: lastLogEntry.gameTime,
        });
        return newState;
      });
    } else {
      // Pause the game
      setGameState((prevState) => {
        const newState = deepClone<IGame>(prevState);
        addLogEntry(newState, NO_PLAYER, GameLogAction.PAUSE);
        return newState;
      });
    }
  };

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Container
        ref={viewportRef}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 1,
          overflow: 'auto',
          maxWidth: '100%',
          paddingBottom: '70px', // fab icons height
        }}
      >
        <Scoreboard />
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mt: 2 }}>
          <Tab label="Player" />
          <Tab label="Adjustments" />
          <Tab label="Supply" />
        </Tabs>
        <ForwardRefBox
          ref={viewBoxRef}
          sx={{
            p: 2,
            flex: 1,
            overflow: 'hidden',
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {tabValue === 0 && <Player containerHeight={containerHeight} />}
          {tabValue === 1 && <TurnAdjustmentsSummary containerHeight={containerHeight} />}
          {tabValue === 2 && <SupplyCounts containerHeight={containerHeight} />}
        </ForwardRefBox>
      </Container>
      <FabContainer>
        <Tooltip title="Next Turn">
          <Fab
            color="primary"
            aria-label="next-turn"
            onClick={nextTurn}
            disabled={!lastActionIsNotPause}
          >
            <NextTurnIcon />
          </Fab>
        </Tooltip>
        <Tooltip title="Undo the most recent update">
          <Fab
            color="secondary"
            aria-label="undo"
            onClick={undoLastAction}
            disabled={!canUndo && !lastActionIsNotPause}
          >
            <UndoIcon />
          </Fab>
        </Tooltip>
        <Tooltip title={lastActionIsNotPause ? 'Pause the game' : 'Unpause the game'}>
          <Fab
            color="primary"
            aria-label={lastActionIsNotPause ? 'pause' : 'unpause'}
            onClick={handlePauseUnpause}
          >
            {lastActionIsNotPause ? <PauseIcon /> : <PlayIcon />}
          </Fab>
        </Tooltip>
        <Tooltip title="End Game">
          <Fab
            color="secondary"
            aria-label="end-game"
            onClick={handleOpenConfirmEndGameDialog}
            disabled={!lastActionIsNotPause}
          >
            <EndGameIcon />
          </Fab>
        </Tooltip>
      </FabContainer>
      {gameState.currentStep === CurrentStep.Game && window.innerWidth > 1300 && (
        <>
          <GameClock />
          <FloatingCounter />
        </>
      )}
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

export default GameInterface;
