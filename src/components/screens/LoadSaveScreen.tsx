import React from 'react';
import { Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadSaveGame from '@/components/LoadSaveGame';
import SaveIcon from '@mui/icons-material/Save';

export default function LoadSaveGameScreen() {
  const location = useLocation();
  const navigate = useNavigate();

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
