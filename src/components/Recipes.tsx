import React, { FC } from 'react';
import TabTitle from '@/components/TabTitle';
import { Recipes } from '@/game/recipes';
import { Box, Link } from '@mui/material';
import {
  applyGroupedAction,
  applyGroupedActionSubAction,
  prepareGroupedActionTriggers,
} from '@/game/dominion-lib-log';
import { useGameContext } from '@/components/GameContext';
import { useAlert } from '@/components/AlertContext';

export const RecipesComponent: FC = () => {
  const { gameState, setGameState } = useGameContext();
  const { showAlert } = useAlert();

  const handleRecipe = (event: React.MouseEvent<HTMLAnchorElement>, recipeName: string) => {
    event.preventDefault();
    const groupedAction = Recipes[recipeName];
    if (!groupedAction) {
      return;
    }
    try {
      const newGame = applyGroupedAction(
        gameState,
        groupedAction,
        new Date(),
        applyGroupedActionSubAction,
        prepareGroupedActionTriggers
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

  return (
    <>
      <TabTitle>Common Actions</TabTitle>
      {Object.entries(Recipes).map(([key, recipe]) => (
        <Box key={key}>
          <Link href="#" onClick={(event) => handleRecipe(event, key)}>
            {recipe.name}
          </Link>
        </Box>
      ))}
    </>
  );
};
