import { Box } from '@mui/material';
import { styled } from '@mui/system';

const CenteredContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  padding: theme.spacing(2),
}));

export default CenteredContainer;
