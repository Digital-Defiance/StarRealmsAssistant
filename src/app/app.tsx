import React, { useRef, ReactElement, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import AboutScreen from '@/components/screens/AboutScreen';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import SaveIcon from '@mui/icons-material/Save';
import BarChartIcon from '@mui/icons-material/BarChart';
import DominionVictoryIcon from '@/assets/images/Dominion-Victory.png';
import TabBarIcon from '@/components/TabBarIcon';
import TabView, { TabViewHandle } from '@/components/TabView';
import DominionAssistantScreen from '@/components/screens/DominionAssistantScreen';
import GameLogScreen from '@/components/screens/GameLogScreen';
import LoadSaveGameScreen from '@/components/screens/LoadSaveScreen';
import theme from '@/components/theme';
import { GameProvider } from '@/components/GameContext';
import { AlertProvider } from '@/components/AlertContext';
import AlertDialog from '@/components/AlertDialog';
import StatisticsScreen from '@/components/screens/StatisticsScreen';

interface ITab {
  label: string;
  icon: ReactElement;
  content: ReactNode;
  path: string;
  index?: boolean;
}

function AppRoutes() {
  const tabViewRef = useRef<TabViewHandle>(null);

  const tabs: ITab[] = [
    {
      label: 'Home',
      icon: <TabBarIcon name="home" icon={HomeIcon} focused={true} />,
      content: <AboutScreen />,
      path: '/',
      index: true,
    },
    {
      label: 'Dominion Assistant',
      icon: <TabBarIcon icon={DominionVictoryIcon} focused={false} />,
      content: <DominionAssistantScreen />,
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

  const routes = useRoutes([
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

  return routes;
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
