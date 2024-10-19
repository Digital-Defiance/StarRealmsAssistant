import React from 'react';
import { Box } from '@mui/material';
import LoadSaveGame from '@/components/LoadSaveGame';
import SaveIcon from '@mui/icons-material/Save';

export default function LoadSaveGameScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        height: '100%',
      }}
    >
      <SaveIcon sx={{ fontSize: 40, marginBottom: 2 }} />
      <LoadSaveGame />
    </Box>
  );
}
