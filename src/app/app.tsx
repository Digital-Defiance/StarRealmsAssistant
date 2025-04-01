import React, { useRef, ReactElement, ReactNode, useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, useLocation, useRoutes } from 'react-router-dom';
import AboutScreen from '@/components/screens/AboutScreen';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import StarRealmsAssistantLogo from '@/assets/images/star-realms-assistant-logo.png';
import TabBarIcon from '@/components/TabBarIcon';
import TabView, { TabViewHandle } from '@/components/TabView';
import StarRealmsAssistantScreen from '@/components/screens/StarRealmsScreen';
import GameLogScreen from '@/components/screens/GameLogScreen';
import LoadSaveGameScreen from '@/components/screens/LoadSaveScreen';
import theme from '@/components/theme';
import { GameProvider } from '@/components/GameContext';
import { AlertProvider } from '@/components/AlertContext';
import AlertDialog from '@/components/AlertDialog';
import StatisticsScreen from '@/components/screens/StatisticsScreen';
import { UtilsScreen } from '@/components/screens/UtilsScreen';

interface ITab {
  label: string;
  icon: ReactElement;
  content: ReactNode;
  path: string;
  index?: boolean;
}

function AppRoutes() {
  const tabViewRef = useRef<TabViewHandle>(null);
  const location = useLocation();
  const [utilsEnabled, setUtilsEnabled] = useState(() => {
    return localStorage.getItem('utilsEnabled') === 'true';
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('utils') === 'true') {
      localStorage.setItem('utilsEnabled', 'true');
      setUtilsEnabled(true);
    } else if (searchParams.get('utils') === 'false') {
      localStorage.setItem('utilsEnabled', 'false');
      setUtilsEnabled(false);
    }
  }, [location.search]);

  const tabs: ITab[] = [
    {
      label: 'Home',
      icon: <TabBarIcon name="home" icon={HomeIcon} focused={true} />,
      content: <AboutScreen />,
      path: '/',
      index: true,
    },
    {
      label: 'Star Realms Assistant',
      icon: <TabBarIcon icon={StarRealmsAssistantLogo} focused={false} />,
      content: <StarRealmsAssistantScreen />,
      path: '/assistant',
    },
    {
      label: 'Game Log',
      icon: <TabBarIcon name="log" icon={BookIcon} focused={false} />,
      content: <GameLogScreen tabViewRef={tabViewRef} />,
      path: '/log',
    },
    {
      label: 'Load/Save Game',
      icon: <TabBarIcon name="save" icon={SaveIcon} focused={false} />,
      content: <LoadSaveGameScreen />,
      path: '/load-save',
    },
    {
      label: 'Statistics',
      icon: <TabBarIcon name="statistics" icon={BarChartIcon} focused={false} />,
      content: <StatisticsScreen />,
      path: '/statistics',
    },
  ];

  if (utilsEnabled) {
    tabs.push({
      label: 'Utils',
      icon: <TabBarIcon name="utils" icon={SettingsIcon} focused={false} />,
      content: <UtilsScreen />,
      path: '/utils',
    });
  }

  return useRoutes([
    {
      path: '/',
      element: <TabView ref={tabViewRef} tabs={tabs} />,
      children: tabs.map((tab) => ({
        index: tab.index,
        path: tab.index ? undefined : tab.path,
        element: tab.content,
      })),
    },
  ]);
}

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <GameProvider>
        <AlertProvider>
          <Router>
            <AppRoutes />
            <AlertDialog />
          </Router>
        </AlertProvider>
      </GameProvider>
    </ThemeProvider>
  );
}

export default App;
