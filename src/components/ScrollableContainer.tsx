import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const ScrollableContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  boxSizing: 'border-box',
}));

export default ScrollableContainer;
