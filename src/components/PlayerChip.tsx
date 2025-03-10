import { Chip, styled } from '@mui/material';

export const PlayerChip = styled(Chip)({
  '& .MuiChip-label': {
    overflow: 'visible',
    textOverflow: 'clip',
    whiteSpace: 'normal',
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
