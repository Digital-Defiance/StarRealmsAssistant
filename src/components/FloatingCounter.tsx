import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useGameContext } from '@/components/GameContext';
import AuthorityIcon from '@/assets/images/authority.png';
import TradeIcon from '@/assets/images/trade.png';
import CombatIcon from '@/assets/images/combat.png';
import { styled } from '@mui/material';
import { CurrentStep } from '@/game/enumerations/current-step';

const Quantity = styled(Typography)({
  fontFamily: 'Handel Gothic ITC Pro',
  fontWeight: 'bold',
});

// Increase icon size to be more visible
const ICON_SIZE = 24;
const AUTHORITY_SIZE = 48;

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
        display: 'flex',
        flexDirection: 'column',
        minHeight: 160, // Increase height to fit all content
      }}
    >
      {/* Top row with icons and counters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', marginBottom: 3, width: '100%' }}>
        <Box sx={{ textAlign: 'center', position: 'relative', width: 40, height: 40 }}>
          <img
            src={TradeIcon}
            alt="Trade Icon"
            style={{
              position: 'absolute',
              bottom: -18, // Position icon below the number
              left: '50%',
              transform: 'translateX(-50%)',
              width: ICON_SIZE,
              height: ICON_SIZE,
              opacity: 0.9,
            }}
          />
          <Quantity sx={{ fontSize: '1.4rem', position: 'relative', zIndex: 1 }}>
            {gameState.players[gameState.currentPlayerIndex].turn.trade}
          </Quantity>
        </Box>

        <Box sx={{ textAlign: 'center', position: 'relative', width: 40, height: 40 }}>
          <img
            src={CombatIcon}
            alt="Combat Icon"
            style={{
              position: 'absolute',
              bottom: -18, // Position icon below the number
              left: '50%',
              transform: 'translateX(-50%)',
              width: ICON_SIZE,
              height: ICON_SIZE,
              opacity: 0.9,
            }}
          />
          <Quantity sx={{ fontSize: '1.4rem', position: 'relative', zIndex: 1 }}>
            {gameState.players[gameState.currentPlayerIndex].turn.combat}
          </Quantity>
        </Box>
      </Box>

      {/* Bottom row with shield counter */}
      <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', marginTop: 2 }}>
        <img
          src={AuthorityIcon}
          alt="Authority Icon"
          style={{
            position: 'absolute',
            top: '140%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: AUTHORITY_SIZE,
            height: AUTHORITY_SIZE,
            opacity: 0.9,
          }}
        />
        <Box
          sx={{
            width: AUTHORITY_SIZE,
            height: AUTHORITY_SIZE,
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
            {gameState.players[gameState.currentPlayerIndex].authority.authority}
          </Quantity>
        </Box>
      </Box>
    </Box>
  );
};

export default FloatingCounter;
