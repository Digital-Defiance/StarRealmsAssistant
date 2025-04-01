import React, { useEffect, useState } from 'react';
import { Box, Typography, Link, Paper, List, ListItem, ListItemText } from '@mui/material';
import StarRealmsAssistantLogo from '@/assets/images/star-realms-assistant-logo.svg';
import SuperCapsText from '@/components/SuperCapsText';
import {
  APP_FEATURES,
  APP_MINI_DISCLAIMER,
  APP_MINI_DISCLAIMER_NOTE,
  VERSION_NUMBER,
} from '@/game/constants';
import CenteredContainer from '../CenteredContainer';

export default function AboutScreen() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/assets/messages.json');
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.log(data);
          return;
        }
        setMessages(data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setMessages(['Failed to fetch messages. Please try again later.']);
      }
    };

    void fetchMessages();
  }, []);

  return (
    <CenteredContainer
      sx={{
        marginLeft: { xs: 0, md: '15%' },
        marginRight: { xs: 0, md: '15%' },
        minHeight: '100%',
        overflow: 'hidden',
        overflowY: 'auto',
        scrollbarWidth: 'none', // For Firefox
        justifyContent: 'flex-start',
        py: 2,
        '&::-webkit-scrollbar': {
          display: 'none', // For Chrome, Safari, and Opera
        },
        '@media (max-width: 900px)': {
          marginLeft: 0,
          marginRight: 0,
        },
      }}
    >
      <Box sx={{ flexGrow: 1, py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Paper
              elevation={3}
              sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 300,
                  height: 150,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <img
                  src={StarRealmsAssistantLogo}
                  alt="Star Realms Assistant Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
              <Typography
                variant="h4"
                sx={{ fontFamily: 'Handel Gothic ITC Pro', textAlign: 'center', mb: 2 }}
              >
                Unofficial Star Realms Assistant
              </Typography>
              <Typography variant="body1" component="p" align="center">
                This React application enhances your Star Realms gameplay experience with
                comprehensive features for game management, scoring, and player interaction.
              </Typography>
            </Paper>
          </Box>

          {messages.length > 0 && (
            <Box>
              <Paper elevation={3} sx={{ p: 2 }}>
                <SuperCapsText className={`typography-title`}>Messages</SuperCapsText>
                <List dense>
                  {messages.map((message, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={<span dangerouslySetInnerHTML={{ __html: message }} />}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <SuperCapsText className={`typography-title`}>Features</SuperCapsText>
                <List dense>
                  {APP_FEATURES.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <SuperCapsText className={`typography-title`} sx={{ paddingBottom: '10px' }}>
                  About
                </SuperCapsText>
                <Typography variant="body1" component="p">
                  This application is created by{' '}
                  <Link
                    href="https://digitaldefiance.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Digital Defiance
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="https://github.com/JessicaMulein"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Jessica Mulein
                  </Link>
                  . {APP_MINI_DISCLAIMER}
                </Typography>
                <Typography variant="body1" component="p">
                  For more information, contributions, or to report{' '}
                  <Link
                    href="https://github.com/Digital-Defiance/StarRealmsAssistant/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    issues
                  </Link>
                  , please visit our{' '}
                  <Link
                    href="https://github.com/Digital-Defiance/StarRealmsAssistant"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub repository
                  </Link>
                  . Additionally, there is the project{' '}
                  <Link
                    href="https://github.com/orgs/Digital-Defiance/projects/14"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Backlog
                  </Link>
                  .
                </Typography>
                <Typography variant="body1" component="p">
                  {APP_MINI_DISCLAIMER_NOTE}
                </Typography>
                <Typography variant="body1" component="p">
                  See our{' '}
                  <Link
                    href="https://github.com/Digital-Defiance/StarRealmsAssistant?tab=readme-ov-file#disclaimer-for-end-users"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Disclaimer for End Users
                  </Link>{' '}
                  for important information.
                </Typography>
                <Typography variant="body1" component="p" align="center">
                  <Link
                    href="https://github.com/Digital-Defiance/StarRealmsAssistant/blob/main/USER_MANUAL.md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    User Manual
                  </Link>
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box mt={4} width="100%" textAlign="center" sx={{ paddingBottom: '56px' }}>
        <Typography variant="body2">
          Version:{' '}
          <Link
            href="https://github.com/Digital-Defiance/StarRealmsAssistant?tab=readme-ov-file#changelog"
            target="_blank"
            rel="noopener noreferrer"
          >
            {VERSION_NUMBER}
          </Link>
        </Typography>
      </Box>
    </CenteredContainer>
  );
}
