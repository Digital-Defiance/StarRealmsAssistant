import React, { FC } from 'react';
import {
  applyGroupedAction,
  applyGroupedActionSubAction,
  prepareGroupedActionTriggers,
} from '@/game/dominion-lib-log';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { RecipeKey, Recipes } from '@/components/Recipes';
import { Box, Link, Typography } from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import { useAlert } from '@/components/AlertContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/pro-solid-svg-icons';

interface RecipeCardProps {
  recipeKey: RecipeKey;
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

  return (
    <Box key={recipeKey} display="flex" alignItems="center" height="28px">
      <Link
        href="#"
        onClick={(event) => handleRecipe(event, recipeKey)}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Box
          component="span"
          sx={{ fontSize: '26px', display: 'flex', alignItems: 'center', width: '30px' }}
        >
          {recipe.icon ?? <FontAwesomeIcon icon={faPlay} />}
        </Box>
        <Typography className="recipe-name" sx={{ ml: 1 }}>
          {recipe.name}
        </Typography>
      </Link>
    </Box>
  );
};
