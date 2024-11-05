import React, {
  ReactElement,
  ReactNode,
  SyntheticEvent,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

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
    icon: ReactElement;
    content: ReactNode;
    path: string;
  }[];
}

export interface TabViewHandle {
  tabBar: HTMLDivElement | null;
}

const TabView = forwardRef<TabViewHandle, TabViewProps>(({ tabs }, ref) => {
  const location = useLocation();
  const navigate = useNavigate();
  const tabBarRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    tabBar: tabBarRef.current,
  }));

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    navigate(tabs[newValue].path);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Prevent scrollbar on main container
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </Box>
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          boxSizing: 'border-box',
        }}
      >
        <StyledBottomNavigation
          ref={tabBarRef}
          value={tabs.findIndex((tab) => tab.path === location.pathname)}
          onChange={handleChange}
          showLabels
        >
          {tabs.map((tab, index) => (
            <BottomNavigationAction key={index} label={tab.label} icon={tab.icon} />
          ))}
        </StyledBottomNavigation>
      </Paper>
    </Box>
  );
});

TabView.displayName = 'TabView';

export default TabView;
