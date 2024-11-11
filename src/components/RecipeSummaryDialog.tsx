import React, { FC, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  DialogActions,
  Button,
} from '@mui/material';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { RecipeSummary } from '@/components/RecipeSummary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup, faPlay } from '@fortawesome/pro-solid-svg-icons';
import { RecipeSection } from '@/game/interfaces/recipe-section';

interface RecipeSummaryDialogProps {
  open: boolean;
  section: RecipeSection | null;
  recipe: IGroupedAction | null;
  onClose: () => void;
}

export const RecipeSummaryDialog: FC<RecipeSummaryDialogProps> = ({
  open,
  section,
  recipe,
  onClose,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  if (!section || !recipe) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          maxWidth: '80%',
          maxHeight: '80%',
        },
      }}
      aria-labelledby="recipe-summary-dialog-title"
      disableRestoreFocus
    >
      {section !== null && recipe !== null && section !== undefined && recipe !== undefined && (
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 4px',
              borderBottom: '1px solid #ccc',
              backgroundColor: '#f5f5f5',
            }}
          >
            {section.icon ?? <FontAwesomeIcon icon={faLayerGroup} />}
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
              {section.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {recipe.icon ?? <FontAwesomeIcon icon={faPlay} />}
            <Typography variant="subtitle1" sx={{ ml: 1 }}>
              {recipe.name}
            </Typography>
          </Box>
        </DialogTitle>
      )}
      <DialogContent>
        {recipe !== null && recipe !== undefined && <RecipeSummary recipe={recipe} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} ref={closeButtonRef}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
