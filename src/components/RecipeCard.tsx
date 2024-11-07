import React, { FC } from 'react';
import {
  applyGroupedAction,
  applyGroupedActionSubAction,
  prepareGroupedActionTriggers,
} from '@/game/dominion-lib-log';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { Recipes } from '@/game/recipes';
import { Box, Link } from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import { useAlert } from '@/components/AlertContext';

interface RecipeCardProps {
  recipeKey: string;
  recipe: IGroupedAction;
}

export const RecipeCard: FC<RecipeCardProps> = ({ recipeKey, recipe }) => {
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
    <Box key={recipeKey}>
      <Link href="#" onClick={(event) => handleRecipe(event, recipeKey)}>
        {recipe.name}
      </Link>
    </Box>
  );
};
