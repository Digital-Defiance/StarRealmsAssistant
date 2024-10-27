import { Box } from '@mui/material';
import { styled } from '@mui/system';

const CenteredContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 'calc(100vh - 56px)', // instead of minHeight
  overflow: 'auto', // only show scrollbar when needed
  padding: theme.spacing(2),
  boxSizing: 'border-box',
}));

export default CenteredContainer;
