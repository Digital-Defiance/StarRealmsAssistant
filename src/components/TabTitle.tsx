import React, { FC, ReactNode } from 'react';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';
import '@/_typography.scss';

interface TabTitleProps {
  children: ReactNode;
}

const StyledTabTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'TrajanProBold',
  color: theme.palette.text.primary,
}));

const TabTitle: FC<TabTitleProps> = ({ children }) => {
  return (
    <StyledTabTitle variant="h4" className="typography-super-title" gutterBottom>
      {children}
    </StyledTabTitle>
  );
};

export default TabTitle;
