import React from 'react';
import {
  Box,
  Typography,
  Link,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import DominionTransparentLogo from '@/assets/images/Dominion-tx.png';
import SuperCapsText from '../SuperCapsText';
import { TITLE_SIZE } from '../constants';

export default function AboutScreen() {
  return (
    <Container maxWidth="md">
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
                  src={DominionTransparentLogo}
                  alt="Dominion Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
              <Typography
                variant="h4"
                sx={{ fontFamily: 'CharlemagneStdBold', textAlign: 'center', mb: 2 }}
              >
                Unofficial Dominion Assistant
              </Typography>
              <Typography variant="body1" paragraph align="center">
                This React application enhances your Dominion gameplay experience with comprehensive
                features for game management, scoring, and player interaction.
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <SuperCapsText fontSize={TITLE_SIZE}>Features</SuperCapsText>
                <List dense>
                  {[
                    'Player Management: Add, remove, and track multiple players',
                    'Dynamic Scoring: Real-time calculation and leaderboard',
                    'Game Setup Wizard: Customizable game modes and expansions',
                    'Turn Tracking: Keep track of player turns and phases',
                    'Detailed Game Log: Record and review game events',
                    'Expansion Support: Compatible with various Dominion expansions',
                    'Save/Load Games: Save progress and resume later',
                    'Intuitive UI: User-friendly Material-UI components',
                  ].map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <SuperCapsText fontSize={TITLE_SIZE} sx={{ paddingBottom: '10px' }}>
                  About
                </SuperCapsText>
                <Typography variant="body1" paragraph>
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
                  . It is an open-source project and not affiliated with or endorsed by the makers
                  of Dominion or Donald X Vaccarino.
                </Typography>
                <Typography variant="body1" paragraph>
                  For more information, contributions, or to report issues, please visit our{' '}
                  <Link
                    href="https://github.com/Digital-Defiance/DominionAssistant"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub repository
                  </Link>
                  .
                </Typography>
                <Typography variant="body1" paragraph>
                  Please note that this tool requires the physical game of Dominion to play.
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
