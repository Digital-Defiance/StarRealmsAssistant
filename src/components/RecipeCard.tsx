import React, { FC, MouseEvent } from 'react';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { RecipeKey, RecipeSections } from '@/components/Recipes';
import { Box, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/pro-solid-svg-icons';

interface RecipeCardProps {
  section: RecipeSections;
  recipeKey: RecipeKey;
  recipe: IGroupedAction;
  onHover: (section: RecipeSections, recipeKey: RecipeKey) => void;
  onLeave: () => void;
  onClick: (
    event: React.MouseEvent<HTMLDivElement>,
    section: RecipeSections,
    recipeKey: RecipeKey
  ) => void;
}

export const RecipeCard: FC<RecipeCardProps> = ({
  section,
  recipeKey,
  recipe,
  onHover,
  onLeave,
  onClick,
}) => {
  return (
    <Box
      key={recipeKey}
      onClick={(event) => onClick(event, section, recipeKey)}
      onMouseEnter={() => onHover(section, recipeKey)}
      onMouseLeave={onLeave}
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      {recipe.icon ?? <FontAwesomeIcon icon={faPlay} />}
      <Typography variant="body2" sx={{ ml: 1 }}>
        {recipe.name}
      </Typography>
    </Box>
  );
};
