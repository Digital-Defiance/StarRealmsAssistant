import React, { FC } from 'react';
import { Paper, Box } from '@mui/material';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { RecipeSummary } from '@/components/RecipeSummary';

interface RecipeSummaryPopoverProps {
  open: boolean;
  position: { top: number; left: number } | null;
  recipe: IGroupedAction | null;
  listWidth: number;
}

export const RecipeSummaryPopover: FC<RecipeSummaryPopoverProps> = ({
  open,
  position,
  recipe,
  listWidth,
}) => {
  if (!open || !position || !recipe) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
        zIndex: 1300,
        width: `${listWidth / 2}px`,
        maxWidth: '400px',
      }}
    >
      <Paper elevation={3}>
        <Box p={2}>
          <RecipeSummary recipe={recipe} />
        </Box>
      </Paper>
    </Box>
  );
};
