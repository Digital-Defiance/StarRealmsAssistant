import React, { FC } from 'react';
import { Box, Button, FilledInputProps, Stack, TextField, Typography } from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import { IGame } from '@/game/interfaces/game';
import { NewGameState } from '@/game/starrealms-lib';
import CenteredContainer from '@/components/CenteredContainer';
import OptionItem from '@/components/OptionItem';
import TabTitle from '@/components/TabTitle';
import { DEFAULT_STARTING_AUTHORITY, DEFAULT_TURN_CARDS } from '@/game/constants';

interface SetGameOptionsProps {
  startGame: () => void;
}

const SetGameOptions: FC<SetGameOptionsProps> = ({ startGame }) => {
  const { gameState, setGameState } = useGameContext();

  const handleStartGame = () => {
    setGameState((prevState: IGame) => {
      return NewGameState(prevState, new Date());
    });

    startGame();
  };

  // Ensure starting authorities and cards are initialized for all players
  const ensureStartingValues = () => {
    setGameState((prevState: IGame) => {
      const startingAuthorityByPlayerIndex = {
        ...(prevState.options.startingAuthorityByPlayerIndex || []),
      };

      const startingCardsByPlayerIndex = {
        ...(prevState.options.startingCardsByPlayerIndex || []),
      };

      // Set default values for any player that doesn't have them
      prevState.players.forEach((player, index) => {
        if (startingAuthorityByPlayerIndex[index] === undefined) {
          startingAuthorityByPlayerIndex[index] = DEFAULT_STARTING_AUTHORITY;
        }

        if (startingCardsByPlayerIndex[index] === undefined) {
          startingCardsByPlayerIndex[index] = DEFAULT_TURN_CARDS;
        }
      });

      return {
        ...prevState,
        options: {
          ...prevState.options,
          startingAuthorityByPlayerIndex,
          startingCardsByPlayerIndex,
        },
      };
    });
  };

  // Initialize starting values when component mounts
  React.useEffect(() => {
    ensureStartingValues();
  }, [gameState.players.length]);

  // Handle authority change for a specific player
  const handleAuthorityChange = (playerIndex: number, value: number) => {
    setGameState((prevState: IGame) => {
      return {
        ...prevState,
        options: {
          ...prevState.options,
          startingAuthorityByPlayerIndex: {
            ...(prevState.options.startingAuthorityByPlayerIndex || []),
            [playerIndex]: value,
          },
        },
      };
    });
  };

  // Handle cards change for a specific player
  const handleCardsChange = (playerIndex: number, value: number) => {
    setGameState((prevState: IGame) => {
      return {
        ...prevState,
        options: {
          ...prevState.options,
          startingCardsByPlayerIndex: {
            ...(prevState.options.startingCardsByPlayerIndex || {}),
            [playerIndex]: value,
          },
        },
      };
    });
  };

  return (
    <CenteredContainer>
      <TabTitle>Game Options</TabTitle>

      <Typography variant="h6" gutterBottom>
        Player Starting Values
      </Typography>

      <Stack spacing={2} sx={{ mb: 2 }}>
        {gameState.players.map((player, index) => (
          <Box key={index} sx={{ width: '100%', px: 1 }}>
            <Typography variant="subtitle1">{player.name}</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Starting Authority"
                type="number"
                variant="outlined"
                margin="normal"
                slotProps={{
                  input: {
                    min: 1,
                  } as FilledInputProps,
                }}
                value={
                  gameState.options.startingAuthorityByPlayerIndex[index] !== undefined
                    ? gameState.options.startingAuthorityByPlayerIndex[index]
                    : DEFAULT_STARTING_AUTHORITY
                }
                onChange={(e) =>
                  handleAuthorityChange(
                    index,
                    parseInt(e.target.value) || DEFAULT_STARTING_AUTHORITY
                  )
                }
              />

              <TextField
                fullWidth
                label="Starting Cards"
                type="number"
                variant="outlined"
                margin="normal"
                slotProps={{
                  input: {
                    min: 0,
                  } as FilledInputProps,
                }}
                value={
                  gameState.options.startingCardsByPlayerIndex?.[index] !== undefined
                    ? gameState.options.startingCardsByPlayerIndex[index]
                    : DEFAULT_TURN_CARDS
                }
                onChange={(e) =>
                  handleCardsChange(index, parseInt(e.target.value) || DEFAULT_TURN_CARDS)
                }
              />
            </Stack>
          </Box>
        ))}
      </Stack>

      <hr />
      <Typography variant="h6" gutterBottom>
        Features
      </Typography>

      <OptionItem
        checked={gameState.options.trackCardCounts}
        onChange={(e) => {
          setGameState((prevState: IGame) => {
            return {
              ...prevState,
              options: { ...prevState.options, trackCardCounts: e.target.checked },
            };
          });
        }}
        title="Track Card Counts"
        tooltip="Whether to track the number of cards in each player's hand"
      />

      <OptionItem
        checked={gameState.options.trackCardGains}
        onChange={(e) => {
          setGameState((prevState: IGame) => {
            return {
              ...prevState,
              options: { ...prevState.options, trackCardGains: e.target.checked },
            };
          });
        }}
        title="Track Card Gains"
        tooltip="Whether to track the cards gained by each player"
      />

      <OptionItem
        checked={gameState.options.trackDiscard}
        onChange={(e) => {
          setGameState((prevState: IGame) => {
            return {
              ...prevState,
              options: { ...prevState.options, trackDiscrd: e.target.checked },
            };
          });
        }}
        title="Track Discards"
        tooltip="Whether to track the cards discarded by each player"
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Button variant="contained" onClick={handleStartGame}>
          Start Game
        </Button>
      </Box>
    </CenteredContainer>
  );
};

export default SetGameOptions;
