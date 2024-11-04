import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import { useGameContext } from '@/components/GameContext';
import { calculateVictoryPoints } from '@/game/dominion-lib';
import DominionVictoryIcon from '@/assets/images/Dominion-Victory.png';
import { styled } from '@mui/material';
import { CurrentStep } from '@/game/enumerations/current-step';

const Quantity = styled(Typography)({
  fontFamily: 'TrajanProBold',
  fontWeight: 'bold',
});

const FloatingCounter = () => {
  const { gameState } = useGameContext();

  if (gameState.currentStep !== CurrentStep.Game) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 250,
        left: 20,
        padding: 2,
        backgroundColor: gameState.players[gameState.currentPlayerIndex].color,
        borderRadius: 2,
        boxShadow: 3,
        color: 'white',
        textShadow: '2px 2px 4px black',
        filter: 'drop-shadow(0 0 0.75rem black)',
      }}
    >
      {/* Top row with icons and counters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', marginBottom: 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          <SettingsIcon fontSize="large" />
          <Quantity sx={{ fontSize: '1.4rem' }}>
            {gameState.players[gameState.currentPlayerIndex].turn.actions}
          </Quantity>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <MonetizationOnIcon fontSize="large" />
          <Quantity sx={{ fontSize: '1.4rem' }}>
            {gameState.players[gameState.currentPlayerIndex].turn.coins}
          </Quantity>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <LocalMallIcon fontSize="large" />
          <Quantity sx={{ fontSize: '1.4rem' }}>
            {gameState.players[gameState.currentPlayerIndex].turn.buys}
          </Quantity>
        </Box>
      </Box>

      {/* Bottom row with shield counter */}
      <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <img
          src={DominionVictoryIcon}
          alt="Victory Icon"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 48,
            height: 48,
            opacity: 0.9,
            zIndex: -1,
          }}
        />
        <Box
          sx={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Quantity
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '3rem',
              textShadow: '2px 2px 4px black',
            }}
          >
            {calculateVictoryPoints(gameState.players[gameState.currentPlayerIndex])}
          </Quantity>
        </Box>
      </Box>
    </Box>
  );
};

export default FloatingCounter;
