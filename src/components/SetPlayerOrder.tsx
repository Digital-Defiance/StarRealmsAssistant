import React, { FC, useCallback, useEffect } from 'react';
import {
  Button,
  List,
  ListItemText,
  ListItemButton,
  Box,
  Tooltip,
  IconButton,
  Typography,
} from '@mui/material';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { useGameContext } from '@/components/GameContext';
import theme from '@/components/theme';
import CenteredContainer from '@/components/CenteredContainer';
import TabTitle from '@/components/TabTitle';
import SuperCapsText from '@/components/SuperCapsText';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';
import { IPlayer } from '@/game/interfaces/player';

interface SetPlayerOrderProps {
  nextStep: () => void;
}

interface PlayerMapping {
  player: IPlayer;
  originalIndex: number;
}

// Fisher-Yates shuffle algorithm
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const shuffleArray = <T extends unknown>(array: T[]): { shuffled: T[]; changed: boolean } => {
  let changed = false;
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  for (let i = 0; i < shuffled.length; i++) {
    if (shuffled[i] !== array[i]) {
      changed = true;
      break;
    }
  }
  return { shuffled, changed };
};

const SetPlayerOrder: FC<SetPlayerOrderProps> = ({ nextStep }) => {
  const { gameState, setGameState } = useGameContext();
  const [shuffleChanged, setShuffleChanged] = React.useState<boolean | undefined>(undefined);

  const selectRandomFirstPlayer = useCallback(() => {
    if (gameState.players.length > 0) {
      const randomIndex = Math.floor(Math.random() * gameState.players.length);
      setGameState((prevState: IGame) => {
        const newGame = deepClone<IGame>(prevState);
        newGame.currentPlayerIndex = randomIndex;
        newGame.selectedPlayerIndex = randomIndex;
        return newGame;
      });
    }
  }, [gameState.players.length, setGameState]);

  const shufflePlayers = useCallback(() => {
    setShuffleChanged(false);
    setGameState((prevState: IGame) => {
      const newGame = deepClone<IGame>(prevState);

      // Create a mapping structure to track original indices
      const playerMappings: PlayerMapping[] = newGame.players.map((player, index) => ({
        player: deepClone(player),
        originalIndex: index,
      }));

      // Check if there's a boss player (always at index 0 if present)
      const hasBoss = newGame.players.length > 0 && newGame.players[0].boss;

      if (hasBoss) {
        // Keep boss at index 0 and shuffle the rest
        const bossPlayer = playerMappings[0];
        const { shuffled: otherPlayers, changed } = shuffleArray<PlayerMapping>(
          playerMappings.slice(1)
        );
        setShuffleChanged(changed);
        playerMappings.splice(0, playerMappings.length, bossPlayer, ...otherPlayers);
        // Update player array with new order
        newGame.players = playerMappings.map((mapping) => mapping.player);
      } else {
        // Shuffle all players if no boss
        const { shuffled } = shuffleArray(playerMappings);
        newGame.players = shuffled.map((mapping) => mapping.player);
      }

      // Create new mappings for authority and cards
      const newStartingAuthorityByPlayerIndex: number[] = [];
      const newStartingCardsByPlayerIndex: number[] = [];

      // Update indices for authority and cards
      playerMappings.forEach((mapping, newIndex) => {
        const oldIndex = mapping.originalIndex;

        // Copy authority values
        if (newGame.options.startingAuthorityByPlayerIndex[oldIndex] !== undefined) {
          newStartingAuthorityByPlayerIndex[newIndex] =
            newGame.options.startingAuthorityByPlayerIndex[oldIndex];
        }

        // Copy starting cards values
        if (newGame.options.startingCardsByPlayerIndex[oldIndex] !== undefined) {
          newStartingCardsByPlayerIndex[newIndex] =
            newGame.options.startingCardsByPlayerIndex[oldIndex];
        }
      });

      // Update with new mappings
      newGame.options.startingAuthorityByPlayerIndex = newStartingAuthorityByPlayerIndex;
      newGame.options.startingCardsByPlayerIndex = newStartingCardsByPlayerIndex;

      newGame.currentPlayerIndex = 0;
      newGame.selectedPlayerIndex = 0;

      return newGame;
    });
  }, [setGameState]);

  useEffect(() => {
    selectRandomFirstPlayer();
  }, [selectRandomFirstPlayer]);

  return (
    <CenteredContainer>
      <TabTitle>Set Player Order</TabTitle>
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
        <List sx={{ width: '100%' }}>
          {gameState.players.map((player, index) => (
            <ListItemButton
              key={`player-${index}`}
              selected={gameState.selectedPlayerIndex === index}
              onClick={() => {
                setGameState((prevState: IGame) => {
                  const newGame = deepClone<IGame>(prevState);
                  newGame.selectedPlayerIndex = index;
                  newGame.currentPlayerIndex = index;
                  return newGame;
                });
              }}
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
                    />
                    <Typography
                      component="span"
                      sx={{
                        fontFamily: 'Handel Gothic ITC Pro',
                        marginRight: 1,
                      }}
                    >
                      {`${index + 1}.`}
                    </Typography>
                    <SuperCapsText className="typography-title">{player.name}</SuperCapsText>
                  </Box>
                }
              />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Tooltip title="Shuffle Player Order">
            <IconButton onClick={shufflePlayers} color="secondary">
              <ShuffleIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {shuffleChanged === false && (
        <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography align="center" variant="body2">
            Players were shuffled but the order remained the same.
          </Typography>
        </Box>
      )}
      <Button
        fullWidth
        variant="contained"
        style={{
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
        }}
        onClick={nextStep}
        disabled={gameState.selectedPlayerIndex === null}
        sx={{ mt: 2 }}
      >
        Next
      </Button>
    </CenteredContainer>
  );
};

export default SetPlayerOrder;
