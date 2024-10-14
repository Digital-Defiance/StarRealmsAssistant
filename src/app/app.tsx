import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AboutScreen from '@/components/screens/AboutScreen';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import SaveIcon from '@mui/icons-material/Save';
import DominionVictoryIcon from '@/assets/images/Dominion-Victory.png';
import TabBarIcon from '@/components/TabBarIcon';
import TabView from '@/components/TabView';
import DominionAssistantScreen from '@/components/screens/DominionAssistantScreen';
import GameLogScreen from '@/components/screens/GameLogScreen';
import LoadSaveGameScreen from '@/components/screens/LoadSaveScreen';
import theme from '@/components/theme';
import { GameProvider } from '@/components/GameContext';
import { AlertProvider } from '@/components/AlertContext';
import AlertDialog from '@/components/AlertDialog';

export function App() {
  const tabs = [
    {
      label: 'Home',
      icon: <TabBarIcon name="home" icon={HomeIcon} focused={true} />,
      content: <AboutScreen />,
      path: '/',
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
      content: <GameLogScreen />,
      path: '/log',
    },
    {
      label: 'Load/Save Game',
      icon: <TabBarIcon name="save" icon={SaveIcon} focused={false} />,
      content: <LoadSaveGameScreen />,
      path: '/load-save',
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <GameProvider>
        <AlertProvider>
          <Router>
            <Routes>
              {tabs.map((tab, index) => (
                <Route key={index} path={tab.path} element={tab.content} />
              ))}
            </Routes>
            <TabView tabs={tabs} />
            <AlertDialog />
          </Router>
        </AlertProvider>
      </GameProvider>
    </ThemeProvider>
  );
}

export default App;
