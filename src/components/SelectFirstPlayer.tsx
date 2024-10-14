import React, { useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
} from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useGameContext } from '@/components/GameContext';

interface SelectFirstPlayerProps {
  nextStep: () => void;
}

const SelectFirstPlayer: React.FC<SelectFirstPlayerProps> = ({ nextStep }) => {
  const { gameState, setGameState } = useGameContext();
  const theme = useTheme();

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
    <Box>
      <Typography variant="h4">Select First Player</Typography>
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
            <ListItemText primary={player.name} />
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
    </Box>
  );
};

export default SelectFirstPlayer;
