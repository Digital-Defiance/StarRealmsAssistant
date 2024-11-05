import React, { FC, useCallback, useEffect } from 'react';
import {
  Button,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Tooltip,
  IconButton,
} from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { useGameContext } from '@/components/GameContext';
import theme from '@/components/theme';
import CenteredContainer from '@/components/CenteredContainer';
import TabTitle from '@/components/TabTitle';
import SuperCapsText from '@/components/SuperCapsText';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';

interface SelectFirstPlayerProps {
  nextStep: () => void;
}

const SelectFirstPlayer: FC<SelectFirstPlayerProps> = ({ nextStep }) => {
  const { gameState, setGameState } = useGameContext();

  const selectRandomFirstPlayer = useCallback(() => {
    if (gameState.players.length > 0) {
      const randomIndex = Math.floor(Math.random() * gameState.players.length);
      setGameState((prevState: IGame) => {
        const newGame = deepClone<IGame>(prevState);
        newGame.currentPlayerIndex = randomIndex;
        newGame.firstPlayerIndex = randomIndex;
        newGame.selectedPlayerIndex = randomIndex;
        return newGame;
      });
    }
  }, [gameState.players.length, setGameState]);

  useEffect(() => {
    selectRandomFirstPlayer();
  }, [selectRandomFirstPlayer]);

  return (
    <CenteredContainer>
      <TabTitle>Select First Player</TabTitle>
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
        <List>
          {gameState.players.map((player, index) => (
            <ListItemButton
              key={player.name}
              selected={gameState.selectedPlayerIndex === index}
              onClick={() => {
                setGameState((prevState: IGame) => {
                  const newGame = deepClone<IGame>(prevState);
                  newGame.selectedPlayerIndex = index;
                  newGame.currentPlayerIndex = index;
                  newGame.firstPlayerIndex = index;
                  return newGame;
                });
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
        <Tooltip title="Select Random First Player">
          <IconButton onClick={selectRandomFirstPlayer} color="primary">
            <ShuffleIcon />
          </IconButton>
        </Tooltip>
      </Box>
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
