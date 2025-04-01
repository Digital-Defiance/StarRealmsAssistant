import React, { FC } from 'react';
import {
  Box,
  Button,
  FilledInputProps,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import { IGame } from '@/game/interfaces/game';
import { hasBoss, NewGameState } from '@/game/starrealms-lib';
import CenteredContainer from '@/components/CenteredContainer';
import OptionItem from '@/components/OptionItem';
import TabTitle from '@/components/TabTitle';
import { DEFAULT_STARTING_AUTHORITY, DEFAULT_TURN_CARDS } from '@/game/constants';
import * as Yup from 'yup';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';

interface SetGameOptionsProps {
  startGame: () => void;
}

interface GameOptionsFormValues {
  bossStartTurn?: number;
  startingAuthorityByPlayerIndex: number[];
  startingCardsByPlayerIndex: number[];
  trackCardCounts: boolean;
  trackCardGains: boolean;
  trackDiscard: boolean;
  trackAssimilation: boolean;
}

const SetGameOptions: FC<SetGameOptionsProps> = ({ startGame }) => {
  const { gameState, setGameState } = useGameContext();
  const gameHasBoss = hasBoss(gameState.players);

  // Initialize starting values when component mounts
  React.useEffect(() => {
    // Ensure starting authorities and cards are initialized for all players
    const ensureStartingValues = () => {
      setGameState((prevState: IGame) => {
        const startingAuthorityByPlayerIndex = Array.isArray(
          prevState.options.startingAuthorityByPlayerIndex
        )
          ? [...prevState.options.startingAuthorityByPlayerIndex]
          : [];

        const startingCardsByPlayerIndex = Array.isArray(
          prevState.options.startingCardsByPlayerIndex
        )
          ? [...prevState.options.startingCardsByPlayerIndex]
          : [];

        // Set default values for any player that doesn't have them
        prevState.players.forEach((player, index) => {
          startingAuthorityByPlayerIndex[index] =
            startingAuthorityByPlayerIndex[index] ?? DEFAULT_STARTING_AUTHORITY;
          startingCardsByPlayerIndex[index] =
            startingCardsByPlayerIndex[index] ?? DEFAULT_TURN_CARDS;
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

    ensureStartingValues();
  }, [gameState.players.length, setGameState]);

  const initialValues: GameOptionsFormValues = {
    bossStartTurn: gameState.options.bossStartTurn ?? (gameHasBoss ? 0 : undefined),
    startingAuthorityByPlayerIndex: Array.isArray(gameState.options.startingAuthorityByPlayerIndex)
      ? [...gameState.options.startingAuthorityByPlayerIndex]
      : Array(gameState.players.length).fill(DEFAULT_STARTING_AUTHORITY),
    startingCardsByPlayerIndex: Array.isArray(gameState.options.startingCardsByPlayerIndex)
      ? [...gameState.options.startingCardsByPlayerIndex]
      : Array(gameState.players.length).fill(DEFAULT_TURN_CARDS),
    trackCardCounts: gameState.options.trackCardCounts || false,
    trackCardGains: gameState.options.trackCardGains || false,
    trackDiscard: gameState.options.trackDiscard || false,
    trackAssimilation: gameState.options.trackAssimilation || false,
  };

  const validationSchema = Yup.object().shape({
    bossStartTurn: Yup.number().optional().min(0, 'Boss start turn must be at least 0'),
    startingAuthorityByPlayerIndex: Yup.array().of(
      Yup.number().required('Required').min(0, 'Authority must be at least 0')
    ),
    startingCardsByPlayerIndex: Yup.array().of(
      Yup.number().required('Required').min(0, 'Cards must be at least 0')
    ),
    trackCardCounts: Yup.boolean(),
    trackCardGains: Yup.boolean(),
    trackDiscard: Yup.boolean(),
    trackAssimilation: Yup.boolean(),
  }) as Yup.ObjectSchema<GameOptionsFormValues>;

  const handleFormSubmit = (values: GameOptionsFormValues) => {
    setGameState((prevState: IGame) => {
      const updatedState: IGame = {
        ...prevState,
        options: {
          ...prevState.options,
          bossStartTurn:
            values.bossStartTurn && values.bossStartTurn > 0 ? values.bossStartTurn : undefined,
          startingAuthorityByPlayerIndex: values.startingAuthorityByPlayerIndex,
          startingCardsByPlayerIndex: values.startingCardsByPlayerIndex,
          trackCardCounts: values.trackCardCounts,
          trackCardGains: values.trackCardGains,
          trackDiscard: values.trackDiscard,
          trackAssimilation: values.trackAssimilation,
        },
      };
      const newGameState = NewGameState(updatedState, new Date());
      return newGameState;
    });

    startGame();
  };

  return (
    <CenteredContainer>
      <TabTitle>Game Options</TabTitle>

      <Formik<GameOptionsFormValues>
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          setFieldValue,
          isValid,
        }: {
          values: GameOptionsFormValues;
          errors: FormikErrors<GameOptionsFormValues>;
          touched: FormikTouched<GameOptionsFormValues>;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handleChange: (e: React.ChangeEvent<any>) => void;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setFieldValue: (field: string, value: any) => void;
          isValid: boolean;
        }) => (
          <Form>
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
                      name={`startingAuthorityByPlayerIndex[${index}]`}
                      slotProps={{
                        input: {
                          min: 0,
                        } as FilledInputProps,
                      }}
                      value={
                        values.startingAuthorityByPlayerIndex[index] ?? DEFAULT_STARTING_AUTHORITY
                      }
                      onChange={handleChange}
                      error={Boolean(
                        Array.isArray(touched.startingAuthorityByPlayerIndex) &&
                          touched.startingAuthorityByPlayerIndex[index] &&
                          Array.isArray(errors.startingAuthorityByPlayerIndex) &&
                          errors.startingAuthorityByPlayerIndex[index]
                      )}
                      helperText={
                        Array.isArray(touched.startingAuthorityByPlayerIndex) &&
                        touched.startingAuthorityByPlayerIndex[index] &&
                        Array.isArray(errors.startingAuthorityByPlayerIndex) &&
                        errors.startingAuthorityByPlayerIndex[index]
                      }
                    />

                    <TextField
                      fullWidth
                      label="Starting Cards"
                      type="number"
                      variant="outlined"
                      margin="normal"
                      name={`startingCardsByPlayerIndex[${index}]`}
                      slotProps={{
                        input: {
                          min: 0,
                        } as FilledInputProps,
                      }}
                      value={values.startingCardsByPlayerIndex[index] ?? DEFAULT_TURN_CARDS}
                      onChange={handleChange}
                      error={Boolean(
                        Array.isArray(touched.startingCardsByPlayerIndex) &&
                          touched.startingCardsByPlayerIndex[index] &&
                          Array.isArray(errors.startingCardsByPlayerIndex) &&
                          errors.startingCardsByPlayerIndex[index]
                      )}
                      helperText={
                        Array.isArray(touched.startingCardsByPlayerIndex) &&
                        touched.startingCardsByPlayerIndex[index] &&
                        Array.isArray(errors.startingCardsByPlayerIndex) &&
                        errors.startingCardsByPlayerIndex[index]
                      }
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
            {gameHasBoss && (
              <>
                <hr />
                <Typography variant="h6" gutterBottom>
                  Boss Options
                </Typography>

                <Tooltip title="The number of turns the boss skips before having its first turn. The boss will wait for each player to have gone this many times before starting.">
                  <TextField
                    fullWidth
                    label="Boss Start Turn"
                    type="number"
                    variant="outlined"
                    margin="normal"
                    name="bossStartTurn"
                    slotProps={{
                      input: {
                        min: 0,
                      } as FilledInputProps,
                    }}
                    value={values.bossStartTurn ?? ''}
                    onChange={handleChange}
                    error={Boolean(touched.bossStartTurn && errors.bossStartTurn)}
                    helperText={touched.bossStartTurn && errors.bossStartTurn}
                  />
                </Tooltip>
              </>
            )}
            <hr />
            <Typography variant="h6" gutterBottom>
              Features
            </Typography>

            <OptionItem
              checked={values.trackCardCounts}
              onChange={(e) => {
                setFieldValue('trackCardCounts', e.target.checked);
              }}
              title="Track Card Counts"
              tooltip="Whether to track the number of cards in each player's hand"
            />

            <OptionItem
              checked={values.trackCardGains}
              onChange={(e) => {
                setFieldValue('trackCardGains', e.target.checked);
              }}
              title="Track Card Gains"
              tooltip="Whether to track the cards gained by each player"
            />

            <OptionItem
              checked={values.trackDiscard}
              onChange={(e) => {
                setFieldValue('trackDiscard', e.target.checked);
              }}
              title="Track Discards"
              tooltip="Whether to track the cards discarded by each player"
            />

            {gameHasBoss && (
              <OptionItem
                checked={values.trackAssimilation}
                onChange={(e) => {
                  setFieldValue('trackAssimilation', e.target.checked);
                }}
                title="Track Boss Assimilation"
                tooltip="Whether to track Boss Assimilation"
              />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
              <Button variant="contained" type="submit" disabled={!isValid}>
                Start Game
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </CenteredContainer>
  );
};

export default SetGameOptions;
