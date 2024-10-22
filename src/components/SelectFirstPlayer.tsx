import React, { useCallback, useEffect } from 'react';
import { Button, List, ListItemIcon, ListItemText, ListItemButton, Box } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useGameContext } from '@/components/GameContext';
import theme from '@/components/theme';
import CenteredContainer from '@/components/CenteredContainer';
import TabTitle from '@/components/TabTitle';
import SuperCapsText from '@/components/SuperCapsText';

interface SelectFirstPlayerProps {
  nextStep: () => void;
}

const SelectFirstPlayer: React.FC<SelectFirstPlayerProps> = ({ nextStep }) => {
  const { gameState, setGameState } = useGameContext();

  const selectRandomFirstPlayer = useCallback(() => {
    if (gameState.players.length > 0) {
      const randomIndex = Math.floor(Math.random() * gameState.players.length);
      setGameState((prevState) => ({
        ...prevState,
        currentPlayerIndex: randomIndex,
        firstPlayerIndex: randomIndex,
        selectedPlayerIndex: randomIndex,
      }));
    }
  }, [gameState.players.length, setGameState]);

  useEffect(() => {
    selectRandomFirstPlayer();
  }, [selectRandomFirstPlayer]);

  return (
    <CenteredContainer>
      <TabTitle>Select First Player</TabTitle>
      <List>
        {gameState.players.map((player, index) => (
          <ListItemButton
            key={player.name}
            selected={gameState.selectedPlayerIndex === index}
            onClick={() => {
              setGameState((prevState) => ({
                ...prevState,
                selectedPlayerIndex: index,
                currentPlayerIndex: index,
                firstPlayerIndex: index,
              }));
            }}
          >
            <ListItemIcon>
              {gameState.selectedPlayerIndex === index && (
                <ArrowRightIcon style={{ color: theme.palette.secondary.main }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: player.color,
                      cursor: 'pointer',
                      marginRight: 1,
                    }}
                  />
                  <SuperCapsText className="typography-title">{player.name}</SuperCapsText>
                </Box>
              }
            />
          </ListItemButton>
        ))}
      </List>
      <Button variant="contained" color="primary" onClick={selectRandomFirstPlayer}>
        Select Random First Player
      </Button>
      <Button
        variant="contained"
        style={{
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
        }}
        onClick={nextStep}
        disabled={gameState.selectedPlayerIndex === null}
      >
        Next
      </Button>
    </CenteredContainer>
  );
};

export default SelectFirstPlayer;
