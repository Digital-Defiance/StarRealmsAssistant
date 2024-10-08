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
import { Image, Platform, StyleSheet } from 'react-native';
import { useAssets } from 'expo-asset';
import DominionTransparentLogo from '@/assets/images/Dominion-tx.png';

export default function HomeScreen() {
  const [assets, error] = useAssets([DominionTransparentLogo]);

  const renderLogo = () => {
    if (error) {
      console.error('Error loading image:', error);
      return <Typography color="error">Error loading logo</Typography>;
    }

    if (!assets) {
      return <Typography>Loading logo...</Typography>;
    }

    const logoUri = assets[0]?.uri;

    if (!logoUri) {
      console.error('Logo URI is undefined');
      return <Typography color="error">Logo not found</Typography>;
    }

    return Platform.OS === 'web' ? (
      <img
        src={logoUri}
        alt="Dominion Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    ) : (
      <Image
        source={{ uri: logoUri }}
        style={{
          width: '100%',
          height: '100%',
          resizeMode: 'contain',
        }}
      />
    );
  };

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
                {renderLogo()}
              </Box>
              <Typography
                variant="h4"
                sx={{ fontFamily: 'CharlemagneStdBold', textAlign: 'center', mb: 2 }}
              >
                Unofficial Dominion Assistant
              </Typography>
              <Typography variant="body1" paragraph align="center">
                This React Native application enhances your Dominion gameplay experience with
                comprehensive features for game management, scoring, and player interaction.
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Features
                </Typography>
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
                    'Cross-Platform: Works on iOS, Android, and web browsers',
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
                <Typography variant="h6" gutterBottom>
                  About
                </Typography>
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

const styles = StyleSheet.create({
  logo: {
    width: '100%',
    height: '100%',
  },
});
