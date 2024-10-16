import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGameContext } from '@/components/GameContext';
import { newPlayer } from '@/game/dominion-lib';
import { MAX_PLAYERS, MIN_PLAYERS } from '@/game/constants';

interface AddPlayerNamesProps {
  nextStep: () => void;
}

const AddPlayerNames: React.FC<AddPlayerNamesProps> = ({ nextStep }) => {
  const { gameState, setGameState } = useGameContext();
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    setGameState((prevState) => ({
      ...prevState,
      numSets: prevState.players.length > 4 ? 2 : 1,
    }));
  }, [setGameState, gameState.players.length]);

  const addPlayer = () => {
    if (playerName.trim()) {
      setGameState((prevState) => ({
        ...prevState,
        players: [...prevState.players, newPlayer(playerName)],
      }));
      setPlayerName('');
    }
  };

  const removePlayer = (index: number) => {
    setGameState((prevState) => ({
      ...prevState,
      players: prevState.players.filter((_, i) => i !== index),
    }));
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 360, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Players
      </Typography>
      <List>
        {gameState.players.map((player, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => removePlayer(index)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={`${index + 1}. ${player.name}`} />
          </ListItem>
        ))}
      </List>
      {gameState.players.length < 6 && (
        <Box sx={{ display: 'flex', marginBottom: 2 }}>
          <TextField
            fullWidth
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name"
            variant="outlined"
          />
          <Button variant="contained" onClick={addPlayer} sx={{ marginLeft: 1 }}>
            Add
          </Button>
        </Box>
      )}
      {gameState.players.length >= 5 && (
        <Typography variant="body2" color="error">
          * Two sets of base cards required for 5-6 players.
        </Typography>
      )}
      {gameState.players.length >= MIN_PLAYERS && gameState.players.length <= MAX_PLAYERS && (
        <Button fullWidth variant="contained" onClick={nextStep}>
          Next
        </Button>
      )}
    </Box>
  );
};

export default AddPlayerNames;
