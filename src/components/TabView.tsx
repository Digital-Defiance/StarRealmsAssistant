// src/components/TabView.tsx
import React, { useState } from 'react';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { styled } from '@mui/system';

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: theme.palette.background.paper,
}));

interface TabViewProps {
  tabs: {
    label: string;
    icon: React.ReactElement;
    content: React.ReactNode;
  }[];
}

const TabView: React.FC<TabViewProps> = ({ tabs }) => {
  const [value, setValue] = useState(0);

  return (
    <Box sx={{ paddingBottom: '56px' }}>
      <Box sx={{ flexGrow: 1 }}>{tabs[value].content}</Box>
      <Paper elevation={3}>
        <StyledBottomNavigation
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          showLabels
        >
          {tabs.map((tab, index) => (
            <BottomNavigationAction key={index} label={tab.label} icon={tab.icon} />
          ))}
        </StyledBottomNavigation>
      </Paper>
    </Box>
  );
};

export default TabView;
