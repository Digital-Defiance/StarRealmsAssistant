import { Box } from '@mui/material';
import { styled } from '@mui/system';

const CenteredContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 'calc(100vh - 56px)', // Subtract BottomNavigation height
  padding: theme.spacing(2),
  boxSizing: 'border-box',
}));

export default CenteredContainer;
