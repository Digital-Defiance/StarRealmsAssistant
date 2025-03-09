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
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { ColorResult, SketchPicker } from 'react-color';
import { useGameContext } from '@/components/GameContext';
import { getNextAvailablePlayerColor, newPlayer } from '@/game/starrealms-lib';
import {
  BossColor,
  DEFAULT_STARTING_AUTHORITY,
  DEFAULT_TURN_CARDS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  SupplyForPlayerCount,
} from '@/game/constants';
import SuperCapsText from '@/components/SuperCapsText';
import CenteredContainer from '@/components/CenteredContainer';
import TabTitle from '@/components/TabTitle';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';

interface AddPlayerNamesProps {
  nextStep: () => void;
}

interface PlayerFormValues {
  name: string;
  color: string;
}

interface FormValues {
  players: PlayerFormValues[];
  addBoss: boolean;
  newPlayerName: string;
}

const StyledPlayerNumber = styled(Typography)(() => ({
  fontFamily: 'Handel Gothic ITC Pro',
}));

const AddPlayerNames: FC<AddPlayerNamesProps> = ({ nextStep }) => {
  const { gameState, setGameState } = useGameContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(-1);

  const initialValues: FormValues = {
    players: gameState.players.map((player) => ({
      name: player.name,
      color: player.color,
    })),
    addBoss: false,
    newPlayerName: '',
  };

  const validationSchema = Yup.object()
    .shape({
      players: Yup.array()
        .of(
          Yup.object().shape({
            name: Yup.string().required('Name is required'),
            color: Yup.string().required('Color is required'),
          })
        )
        .test('unique-names', 'Player names must be unique', (players) => {
          if (!players) return true;
          const names = players.map((player) => player.name);
          return new Set(names).size === names.length;
        })
        .test('unique-colors', 'Player colors must be unique', (players) => {
          if (!players) return true;
          const colors = players.map((player) => player.color);
          return new Set(colors).size === colors.length;
        })
        .test('min-players-check', `At least ${MIN_PLAYERS} players required`, function (players) {
          if (!players) return false;
          const values = this.parent;
          const totalPlayers = values.addBoss ? players.length + 1 : players.length;
          return totalPlayers >= MIN_PLAYERS;
        }),
      addBoss: Yup.boolean(),
      newPlayerName: Yup.string(),
    })
    .test(
      'max-players-check',
      `Maximum ${MAX_PLAYERS} players allowed (${MAX_PLAYERS - 1} if boss is enabled)`,
      function (values) {
        const maxAllowed = values.addBoss ? MAX_PLAYERS - 1 : MAX_PLAYERS;
        return (values.players?.length ?? 0) <= maxAllowed;
      }
    );

  useEffect(() => {
    setGameState((prevState: IGame) => {
      const newGame = deepClone<IGame>(prevState);
      const minPlayers = Math.max(MIN_PLAYERS, newGame.players.length);
      const supplyInfo = SupplyForPlayerCount(minPlayers);
      newGame.setsRequired = supplyInfo.setsRequired;
      return newGame;
    });
  }, [setGameState, gameState.players.length]);

  const handleColorClick = (event: MouseEvent<HTMLElement>, playerIndex: number) => {
    setCurrentPlayerIndex(playerIndex);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentPlayerIndex(-1);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'color-popover' : undefined;

  const updateGameState = (values: FormValues) => {
    setGameState((prevState: IGame) => {
      const newGame = deepClone<IGame>(prevState);
      newGame.currentPlayerIndex = 0;
      newGame.selectedPlayerIndex = 0;

      // Create new players from form values
      newGame.players = [
        ...(values.addBoss ? [newPlayer('Boss', true, BossColor)] : []),
        ...values.players.map((player) => newPlayer(player.name, false, player.color)),
      ];

      // Reset starting authorities and cards
      newGame.options.startingAuthorityByPlayerIndex = [];
      newGame.options.startingCardsByPlayerIndex = [];

      // Update authorities and starting cards for each player
      newGame.players.forEach((_, index) => {
        newGame.options.startingAuthorityByPlayerIndex[index] = DEFAULT_STARTING_AUTHORITY;
        newGame.options.startingCardsByPlayerIndex[index] = DEFAULT_TURN_CARDS;
      });

      // Update required sets based on player count
      const playerCount = values.addBoss ? values.players.length + 1 : values.players.length;
      const supplyInfo = SupplyForPlayerCount(Math.max(MIN_PLAYERS, playerCount));
      newGame.setsRequired = supplyInfo.setsRequired;

      return newGame;
    });
  };

  return (
    <CenteredContainer>
      <TabTitle>Players</TabTitle>
      <Formik<FormValues>
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          updateGameState(values);
          nextStep();
        }}
      >
        {({ values, errors, touched, handleChange, setFieldValue, isValid, submitForm }) => (
          <Form>
            <List>
              {values.addBoss && (
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: BossColor,
                            cursor: 'pointer',
                            marginRight: 1,
                          }}
                        />
                        <SuperCapsText className="typography-title">1. Boss</SuperCapsText>
                      </Box>
                    }
                  />
                </ListItem>
              )}
              <FieldArray name="players">
                {({ remove, push }) => (
                  <>
                    {values.players.map((player, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton edge="end" aria-label="delete" onClick={() => remove(index)}>
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
                              <StyledPlayerNumber className="typography-title">
                                {`${index + (values.addBoss ? 2 : 1)}.`}
                              </StyledPlayerNumber>
                              &nbsp;&nbsp;
                              <SuperCapsText className="typography-title">
                                {player.name}
                              </SuperCapsText>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}

                    {/* Add new player input */}
                    {values.players.length < (values.addBoss ? MAX_PLAYERS - 1 : MAX_PLAYERS) && (
                      <Box sx={{ display: 'flex', marginBottom: 2, mt: 2 }}>
                        <TextField
                          fullWidth
                          name="newPlayerName"
                          value={values.newPlayerName}
                          onChange={handleChange}
                          placeholder="Enter player name"
                          variant="outlined"
                        />
                        <IconButton
                          color="primary"
                          disabled={!values.newPlayerName.trim()}
                          onClick={() => {
                            if (values.newPlayerName.trim()) {
                              const newColor = getNextAvailablePlayerColor(
                                values.players,
                                values.addBoss
                              );

                              push({ name: values.newPlayerName.trim(), color: newColor });
                              setFieldValue('newPlayerName', '');
                            }
                          }}
                        >
                          <AddCircleIcon />
                        </IconButton>
                      </Box>
                    )}
                  </>
                )}
              </FieldArray>
            </List>
            {/* Display validation errors */}
            {touched.players && errors.players && typeof errors.players === 'string' && (
              <FormHelperText error>{errors.players}</FormHelperText>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.addBoss}
                  onChange={(e) => setFieldValue('addBoss', e.target.checked)}
                  name="addBoss"
                />
              }
              label="Add Boss Player"
              sx={{ marginBottom: 2 }}
            />
            {(values.addBoss ? values.players.length + 1 : values.players.length) >= 2 && (
              <Typography variant="body2" color="error">
                * One additional set of base cards is required for every 2 players added.
              </Typography>
            )}
            <Button
              fullWidth
              variant="contained"
              onClick={submitForm}
              disabled={
                !isValid ||
                (values.addBoss ? values.players.length + 1 : values.players.length) <
                  MIN_PLAYERS ||
                (values.addBoss ? values.players.length + 1 : values.players.length) >
                  MAX_PLAYERS ||
                values.newPlayerName.trim() !== ''
              }
              sx={{ mt: 2 }}
            >
              Next
            </Button>
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
              {currentPlayerIndex !== -1 && values.players[currentPlayerIndex] && (
                <SketchPicker
                  color={values.players[currentPlayerIndex].color || '#000000'}
                  onChange={(color: ColorResult) => {
                    setFieldValue(`players[${currentPlayerIndex}].color`, color.hex);
                  }}
                />
              )}
            </Popover>
          </Form>
        )}
      </Formik>
    </CenteredContainer>
  );
};

export default AddPlayerNames;
