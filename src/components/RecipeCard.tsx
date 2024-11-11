import React, { FC, useState } from 'react';
import PropTypes from 'prop-types';
import {
  RecipeKey,
  RecipeKeyNames,
  Recipes,
  RecipeSectionNames,
  RecipeSections,
} from '@/components/Recipes';
import { Box, Button, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/pro-solid-svg-icons';

interface RecipeCardProps {
  section: RecipeSections;
  recipeKey: RecipeKey;
  onApply: (section: RecipeSections, recipeKey: RecipeKey) => void;
  onDetails: (section: RecipeSections, recipeKey: RecipeKey) => void;
}

export type RecipeButton = 'apply' | 'details';

export const RecipeCard: FC<RecipeCardProps> = React.memo(
  ({ section, recipeKey, onApply, onDetails }) => {
    const [activeButton, setActiveButton] = useState<RecipeButton | null>(null);
    const [highlight, setHighlight] = useState(false);

    const handleButtonClick = (
      buttonType: RecipeButton,
      section: RecipeSections,
      recipeKey: RecipeKey
    ) => {
      setActiveButton(buttonType);
      switch (buttonType) {
        case 'apply':
          setHighlight(true);
          onApply(section, recipeKey);
          break;
        case 'details':
          onDetails(section, recipeKey);
          break;
        default:
          console.error('Invalid button type:', buttonType);
          break;
      }

      setTimeout(() => {
        setActiveButton(null);
        setHighlight(false);
      }, 500);
    };

    const recipe = Recipes[section].recipes[recipeKey];
    if (!recipe) {
      return null;
    }

    return (
      <Box
        key={recipeKey}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: highlight ? 'rgba(200, 200, 200, 0.3)' : 'transparent',
          transition: 'background-color 0.3s',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            flexGrow: 1,
            minWidth: 0,
          }}
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
            sx={{
              color: activeButton === 'apply' ? 'blue' : 'gray',
              borderColor: activeButton === 'apply' ? 'blue' : 'gray',
              mr: 1,
            }}
            onClick={() => {
              handleButtonClick('apply', section, recipeKey);
            }}
          >
            Apply
          </Button>
          <Button
            size="small"
            variant="outlined"
            sx={{
              color: activeButton === 'details' ? 'blue' : 'gray',
              borderColor: activeButton === 'details' ? 'blue' : 'gray',
            }}
            onClick={() => {
              handleButtonClick('details', section, recipeKey);
            }}
          >
            Details
          </Button>
        </Box>
      </Box>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return prevProps.section === nextProps.section && prevProps.recipeKey === nextProps.recipeKey;
  }
);
RecipeCard.displayName = 'RecipeCard';

RecipeCard.propTypes = {
  section: PropTypes.oneOf(
    Object.values(RecipeSectionNames).map((sectionName) => sectionName as RecipeSections)
  ).isRequired,
  recipeKey: PropTypes.oneOf(Object.values(RecipeKeyNames)).isRequired,
  onApply: PropTypes.func.isRequired,
  onDetails: PropTypes.func.isRequired,
};
RecipeCard.displayName = 'RecipeCard';
