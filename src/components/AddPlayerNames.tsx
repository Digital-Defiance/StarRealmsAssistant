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
  styled,
  Popover,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { SketchPicker } from 'react-color';
import { useGameContext } from '@/components/GameContext';
import { newPlayer } from '@/game/dominion-lib';
import { MAX_PLAYERS, MIN_PLAYERS } from '@/game/constants';
import SuperCapsText from '@/components/SuperCapsText';
import CenteredContainer from '@/components/CenteredContainer';
import TabTitle from '@/components/TabTitle';

interface AddPlayerNamesProps {
  nextStep: () => void;
}

const StyledPlayerNumber = styled(Typography)(() => ({
  fontFamily: 'TrajanProBold',
}));

const AddPlayerNames: React.FC<AddPlayerNamesProps> = ({ nextStep }) => {
  const { gameState, setGameState } = useGameContext();
  const [playerName, setPlayerName] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(-1);

  useEffect(() => {
    setGameState((prevState) => ({
      ...prevState,
      numSets: prevState.players.length > 4 ? 2 : 1,
    }));
  }, [setGameState, gameState.players.length]);

  const addPlayer = () => {
    if (playerName.trim()) {
      const nextPlayerIndex = gameState.players.length; // +1, -1
      setGameState((prevState) => ({
        ...prevState,
        players: [...prevState.players, newPlayer(playerName, nextPlayerIndex)],
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

  const handleColorClick = (event: React.MouseEvent<HTMLElement>, playerIndex: number) => {
    setCurrentPlayerIndex(playerIndex);
    setAnchorEl(event.currentTarget);
  };

  const handleColorChange = (color: any) => {
    if (currentPlayerIndex !== -1) {
      setGameState((prevState) => {
        const players = [...prevState.players];
        players[currentPlayerIndex].color = color.hex;
        return { ...prevState, players };
      });
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentPlayerIndex(-1);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'color-popover' : undefined;

  return (
    <CenteredContainer>
      <TabTitle>Players</TabTitle>
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
                    onClick={(e) => handleColorClick(e, index)}
                  />
                  <StyledPlayerNumber className="typography-title">{`${index + 1}.`}</StyledPlayerNumber>
                  &nbsp;&nbsp;
                  <SuperCapsText className="typography-title">{player.name}</SuperCapsText>
                </Box>
              }
            />
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
          <IconButton onClick={addPlayer} color="primary" disabled={!playerName.trim()}>
            <AddCircleIcon />
          </IconButton>
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
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <SketchPicker
          color={
            gameState.players.length > 0 && currentPlayerIndex !== -1
              ? gameState.players[currentPlayerIndex].color
              : '#000000'
          }
          onChange={handleColorChange}
        />
      </Popover>
    </CenteredContainer>
  );
};

export default AddPlayerNames;
