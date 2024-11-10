import React, { FC } from 'react';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { RecipeKey, RecipeSections } from '@/components/Recipes';
import { Box, Button, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/pro-solid-svg-icons';

interface RecipeCardProps {
  section: RecipeSections;
  recipeKey: RecipeKey;
  recipe: IGroupedAction;
  onApply: (section: RecipeSections, recipeKey: RecipeKey) => void;
  onDetails: (section: RecipeSections, recipeKey: RecipeKey) => void;
}

export const RecipeCard: FC<RecipeCardProps> = ({
  section,
  recipeKey,
  recipe,
  onApply,
  onDetails,
}) => {
  return (
    <Box
      key={recipeKey}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flexGrow: 1, minWidth: 0 }}
      >
        {recipe.icon ?? <FontAwesomeIcon icon={faPlay} />}
        <Typography
          variant="body2"
          sx={{ ml: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {recipe.name}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexShrink: 0, ml: 1 }}>
        <Button
          size="small"
          variant="outlined"
          sx={{ color: 'gray', borderColor: 'gray', mr: 1 }}
          onClick={() => onApply(section, recipeKey)}
        >
          Apply
        </Button>
        <Button
          size="small"
          variant="outlined"
          sx={{ color: 'gray', borderColor: 'gray' }}
          onClick={() => onDetails(section, recipeKey)}
        >
          Details
        </Button>
      </Box>
    </Box>
  );
};
