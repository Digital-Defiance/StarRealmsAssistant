import React, { useCallback, useEffect } from 'react';
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

interface SelectFirstPlayerProps {
  nextStep: () => void;
}

const SelectFirstPlayer: React.FC<SelectFirstPlayerProps> = ({ nextStep }) => {
  const { gameState, setGameState } = useGameContext();

  const selectRandomFirstPlayer = useCallback(() => {
    if (gameState.players.length > 0) {
      const randomIndex = Math.floor(Math.random() * gameState.players.length);
      setGameState((prevState: IGame) => ({
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
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
        <List>
          {gameState.players.map((player, index) => (
            <ListItemButton
              key={player.name}
              selected={gameState.selectedPlayerIndex === index}
              onClick={() => {
                setGameState((prevState: IGame) => ({
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
