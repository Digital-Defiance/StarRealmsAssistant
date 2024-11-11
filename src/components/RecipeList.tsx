import React, { FC } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { RecipeKey, Recipes, RecipeSections } from '@/components/Recipes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/pro-solid-svg-icons';
import { RecipeCard } from '@/components/RecipeCard';

interface RecipesProps {
  containerHeight: number;
  containerWidth: number;
  onApply: (section: RecipeSections, recipeKey: RecipeKey) => void;
  onDetails: (section: RecipeSections, recipeKey: RecipeKey) => void;
}

export const RecipesList: FC<RecipesProps> = ({
  containerHeight,
  containerWidth,
  onApply,
  onDetails,
}) => {
  return (
    <Box
      sx={{
        height: containerHeight,
        width: containerWidth,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {Object.entries(Recipes).map(([sectionKey, section]) => (
        <Box key={sectionKey} sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #ccc',
            }}
          >
            {section.icon ?? <FontAwesomeIcon icon={faLayerGroup} />}
            <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'bold' }}>
              {section.title}
            </Typography>
          </Box>
          <Divider />
          {Object.entries(section.recipes).map(([recipeKey]) => (
            <RecipeCard
              key={recipeKey}
              section={sectionKey as RecipeSections}
              recipeKey={recipeKey as RecipeKey}
              onApply={onApply}
              onDetails={onDetails}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default RecipesList;
