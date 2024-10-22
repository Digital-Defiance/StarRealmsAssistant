import { styled, Typography } from '@mui/material';

const SecondarySubtitle = styled(Typography)(({ theme }) => ({
  className: 'typography-subtitle',
  color: theme.palette.text.secondary,
}));

export default SecondarySubtitle;
