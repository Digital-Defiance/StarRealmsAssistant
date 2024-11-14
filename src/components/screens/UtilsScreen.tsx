import { Box, Link, List, ListItem, styled } from '@mui/material';
import React, { FC } from 'react';
import TabTitle from '@/components/TabTitle';
import { useGameContext } from '@/components/GameContext';
import { rebuildGameTimeHistory, rebuildTurnStatisticsCache } from '@/game/dominion-lib-log';
import { deepClone } from '@/game/utils';
import { IGame } from '@/game/interfaces/game';
import { CurrentStep } from '@/game/enumerations/current-step';
import { GameDebug } from '@/components/GameDebug';

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  height: 'calc(100vh - 56px)',
}));

export const UtilsScreen: FC = () => {
  const { gameState, setGameState } = useGameContext();
  const [showGameDebug, setShowGameDebug] = React.useState<boolean>(false);

  const handleRebuildGameTime = () => {
    setGameState((prevState) => {
      if (
        prevState.currentStep !== CurrentStep.Game &&
        prevState.currentStep !== CurrentStep.EndGame
      ) {
        return prevState;
      }
      const newGame = rebuildGameTimeHistory(prevState);
      return newGame;
    });
  };

  const handleRebuildTurnStatistics = () => {
    setGameState((prevState) => {
      if (
        prevState.currentStep !== CurrentStep.Game &&
        prevState.currentStep !== CurrentStep.EndGame
      ) {
        return prevState;
      }
      const newGame = deepClone<IGame>(prevState);
      newGame.turnStatisticsCache = rebuildTurnStatisticsCache(prevState);
      return newGame;
    });
  };

  const handleToggleGameDebug = () => {
    setShowGameDebug((prevShowGameDebug) => !prevShowGameDebug);
  };

  return (
    <StyledContainer>
      <TabTitle>Utilities</TabTitle>
      {(gameState.currentStep === CurrentStep.Game ||
        gameState.currentStep === CurrentStep.EndGame) && (
        <List>
          <ListItem>
            <Link onClick={handleRebuildGameTime}>Rebuild Game Time</Link>
          </ListItem>
          <ListItem>
            <Link onClick={handleRebuildTurnStatistics}>Rebuild Turn Statistics</Link>
          </ListItem>
          <ListItem>
            <Link onClick={handleToggleGameDebug}>
              {showGameDebug ? 'Hide Game Debug' : 'Show Game Debug'}
            </Link>
          </ListItem>
        </List>
      )}
      {gameState.currentStep !== CurrentStep.Game &&
        gameState.currentStep !== CurrentStep.EndGame && (
          <Box>
            The utilities tab is only available when a game is in progress or is in the end game
            state.
          </Box>
        )}
      {showGameDebug && <GameDebug value={JSON.stringify(gameState, null, 2)} />}
    </StyledContainer>
  );
};
