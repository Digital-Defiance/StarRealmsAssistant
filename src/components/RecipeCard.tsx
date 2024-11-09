import React, { FC, MouseEvent, TouchEvent, useEffect, useState } from 'react';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { RecipeKey, RecipeSections } from '@/components/Recipes';
import { Box, styled, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/pro-solid-svg-icons';

interface RecipeCardProps {
  section: RecipeSections;
  recipeKey: RecipeKey;
  recipe: IGroupedAction;
  isActive: boolean;
  onHover: (
    event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
    section: RecipeSections,
    recipeKey: RecipeKey
  ) => void;
  onLeave: () => void;
  onClick: (
    event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
    section: RecipeSections,
    recipeKey: RecipeKey
  ) => void;
  onTouchStart?: () => void;
  onTouchMove?: () => void;
}

const ClickEffectBox = styled(Box)(({ theme }) => ({
  transition: 'all 0.1s ease-in-out',
  '&.click-effect': {
    transform: 'scale(0.98)',
  },
}));

export const RecipeCard: FC<RecipeCardProps> = ({
  section,
  recipeKey,
  recipe,
  isActive,
  onHover,
  onLeave,
  onClick,
  onTouchStart,
  onTouchMove,
}) => {
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isClicked) {
      timer = setTimeout(() => {
        setIsClicked(false);
      }, 300);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isClicked]);

  const handleInteraction = (event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    onClick(event, section, recipeKey);
    setIsClicked(true);
  };

  const handleHover = (event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    onHover(event, section, recipeKey);
  };

  return (
    <ClickEffectBox
      key={recipeKey}
      onClick={handleInteraction}
      onTouchEnd={handleInteraction}
      onMouseEnter={handleHover}
      onMouseLeave={onLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      className={isClicked ? 'click-effect' : ''}
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        backgroundColor: isActive ? 'action.selected' : 'transparent',
        border: '2px solid',
        borderColor: 'transparent',
        borderRadius: '4px',
        padding: '8px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        ...(isClicked && {
          backgroundColor: 'action.selected',
          borderColor: 'primary.main',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
        }),
      }}
    >
      {recipe.icon ?? <FontAwesomeIcon icon={faPlay} />}
      <Typography variant="body2" sx={{ ml: 1 }}>
        {recipe.name}
      </Typography>
    </ClickEffectBox>
  );
};
