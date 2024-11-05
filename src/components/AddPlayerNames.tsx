import React, { FC, MouseEvent, useEffect, useState } from 'react';
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
import { ColorResult, SketchPicker } from 'react-color';
import { useGameContext } from '@/components/GameContext';
import { newPlayer } from '@/game/dominion-lib';
import { MAX_PLAYERS, MIN_PLAYERS, SupplyForPlayerCount } from '@/game/constants';
import SuperCapsText from '@/components/SuperCapsText';
import CenteredContainer from '@/components/CenteredContainer';
import TabTitle from '@/components/TabTitle';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';

interface AddPlayerNamesProps {
  nextStep: () => void;
}

const StyledPlayerNumber = styled(Typography)(() => ({
  fontFamily: 'TrajanProBold',
}));

const AddPlayerNames: FC<AddPlayerNamesProps> = ({ nextStep }) => {
  const { gameState, setGameState } = useGameContext();
  const [playerName, setPlayerName] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(-1);

  useEffect(() => {
    setGameState((prevState: IGame) => {
      const newGame = deepClone<IGame>(prevState);
      const minPlayers = Math.max(MIN_PLAYERS, newGame.players.length);
      const supplyInfo = SupplyForPlayerCount(minPlayers, newGame.options.expansions.prosperity);
      newGame.setsRequired = supplyInfo.setsRequired;
      return newGame;
    });
  }, [setGameState, gameState.players.length]);

  const addPlayer = () => {
    if (playerName.trim()) {
      const nextPlayerIndex = gameState.players.length; // +1, -1
      setGameState((prevState: IGame) => {
        const newGame = deepClone<IGame>(prevState);
        newGame.players = [...newGame.players, newPlayer(playerName, nextPlayerIndex)];
        return newGame;
      });
      setPlayerName('');
    }
  };

  const removePlayer = (index: number) => {
    setGameState((prevState: IGame) => {
      const newGame = deepClone<IGame>(prevState);
      newGame.players = newGame.players.filter((_, i) => i !== index);
      return newGame;
    });
  };

  const handleColorClick = (event: MouseEvent<HTMLElement>, playerIndex: number) => {
    setCurrentPlayerIndex(playerIndex);
    setAnchorEl(event.currentTarget);
  };

  const handleColorChange = (color: ColorResult) => {
    if (currentPlayerIndex !== -1) {
      setGameState((prevState: IGame) => {
        const newGame = deepClone<IGame>(prevState);
        newGame.players[currentPlayerIndex].color = color.hex;
        return newGame;
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
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => {
                  removePlayer(index);
                }}
              >
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
                    onClick={(e) => {
                      handleColorClick(e, index);
                    }}
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
            onChange={(e) => {
              setPlayerName(e.target.value);
            }}
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
