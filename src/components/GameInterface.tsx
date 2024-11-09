import React, {
  FC,
  MouseEvent,
  SyntheticEvent,
  TouchEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
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
import { Pause as PauseIcon, PlayArrow as PlayIcon, Undo as UndoIcon } from '@mui/icons-material';
import Scoreboard from '@/components/Scoreboard';
import Player from '@/components/Player';
import { canUndoAction } from '@/game/dominion-lib-undo';
import { useGameContext } from '@/components/GameContext';
import SupplyCounts from '@/components/SupplyCounts';
import GameClock from '@/components/GameClock';
import { CurrentStep } from '@/game/enumerations/current-step';
import {
  addLogEntry,
  applyGroupedAction,
  applyGroupedActionSubAction,
  prepareGroupedActionTriggers,
} from '@/game/dominion-lib-log';
import { NO_PLAYER } from '@/game/constants';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';
import TurnAdjustmentsSummary from '@/components/TurnAdjustments';
import FloatingCounter from '@/components/FloatingCounter';
import { RecipesList } from '@/components/RecipeList';
import ForwardRefBox from '@/components/ForwardRefBox';
import { RecipeKey, Recipes, RecipeSections } from '@/components/Recipes';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { RecipeSummaryPopover } from '@/components/RecipeSummaryPopover';
import { useAlert } from '@/components/AlertContext';

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

const GameInterface: FC<GameInterfaceProps> = ({ nextTurn, endGame, undoLastAction }) => {
  const { gameState, setGameState } = useGameContext();
  const [canUndo, setCanUndo] = useState(false);
  const [confirmEndGameDialogOpen, setConfirmEndGameDialogOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [tabValue, setTabValue] = useState(0);
  const viewBoxRef = useRef<HTMLDivElement>(null);
  const [hoveredRecipe, setHoveredRecipe] = useState<IGroupedAction | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const [recipeListPosition, setRecipeListPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const { showAlert } = useAlert();

  useEffect(() => {
    setCanUndo(canUndoAction(gameState, gameState.log.length - 1));
  }, [gameState]);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      if (viewBoxRef.current) {
        setContainerHeight(viewBoxRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (viewBoxRef.current) {
      const rect = viewBoxRef.current.getBoundingClientRect();
      setRecipeListPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
      });
      setContainerHeight(rect.height);
    }
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

  const handleRecipeHover = (
    event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
    section: RecipeSections,
    recipeKey: RecipeKey
  ) => {
    const target = event.currentTarget.getBoundingClientRect();
    const viewBoxBound = viewBoxRef.current?.getBoundingClientRect();
    const viewBoxWidth = viewBoxBound?.width ?? 0;

    // Adjust the left position to ensure the popover does not cover the list
    const popoverLeft = target.left + viewBoxWidth / 2;
    const adjustedLeft = Math.min(popoverLeft, window.innerWidth - 400); // Ensure it doesn't go off-screen

    let top = target.top;
    if (viewBoxRef.current) {
      const rect = viewBoxRef.current.getBoundingClientRect();
      top = rect.top;
    }
    if (recipeListPosition) {
      setPopoverPosition({ top: top, left: adjustedLeft });
    }
    const recipe = Recipes[section].recipes[recipeKey];
    setHoveredRecipe(recipe);
  };

  const handleRecipeLeave = () => {
    setHoveredRecipe(null);
    setPopoverPosition(null);
  };

  const handleRecipeClick = (
    event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
    section: RecipeSections,
    recipeKey: RecipeKey
  ) => {
    event.preventDefault();
    const recipeSection = Recipes[section];
    const groupedAction = recipeSection.recipes[recipeKey] as IGroupedAction;

    if (!groupedAction) {
      return;
    }

    try {
      const newGame = applyGroupedAction(
        gameState,
        groupedAction,
        new Date(),
        applyGroupedActionSubAction,
        prepareGroupedActionTriggers,
        recipeKey
      );
      setGameState(newGame);
    } catch (error) {
      if (error instanceof Error) {
        showAlert(`${groupedAction.name} Failed`, error.message);
      } else {
        showAlert(`${groupedAction.name} Failed`, 'Unknown error');
      }
    }
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
        addLogEntry(newState, NO_PLAYER, GameLogAction.UNPAUSE);
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
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 1,
          overflow: 'auto',
        }}
      >
        <Scoreboard />
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mt: 2 }}>
          <Tab label="Player" />
          <Tab label="Adjustments" />
          <Tab label="Supply" />
          <Tab label="Common Actions" />
        </Tabs>
        <ForwardRefBox ref={viewBoxRef} sx={{ p: 2, flex: 1, overflow: 'hidden' }}>
          {tabValue === 0 && (
            <Box
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
            >
              <Player />
              <ButtonContainer>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={nextTurn}
                  disabled={!lastActionIsNotPause}
                >
                  Next Turn
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleOpenConfirmEndGameDialog}
                  disabled={!lastActionIsNotPause}
                >
                  End Game
                </Button>
              </ButtonContainer>
            </Box>
          )}
          {tabValue === 1 && <TurnAdjustmentsSummary containerHeight={containerHeight} />}
          {tabValue === 2 && <SupplyCounts />}
          {tabValue === 3 && (
            <Box sx={{ display: 'flex', height: '100%' }}>
              <Box
                ref={viewBoxRef}
                onMouseLeave={handleRecipeLeave}
                sx={{ flexGrow: 1, overflow: 'hidden' }}
              >
                <RecipesList
                  viewBoxRef={viewBoxRef}
                  onHover={handleRecipeHover}
                  onLeave={handleRecipeLeave}
                  onClick={handleRecipeClick}
                />
              </Box>
              <RecipeSummaryPopover
                open={Boolean(hoveredRecipe)}
                position={popoverPosition}
                recipe={hoveredRecipe}
                listWidth={viewBoxRef.current?.getBoundingClientRect().width ?? 0}
              />
            </Box>
          )}
        </ForwardRefBox>
      </Container>
      <FabContainer>
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
      </FabContainer>
      {gameState.currentStep === CurrentStep.Game && viewportWidth > 1300 && (
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
