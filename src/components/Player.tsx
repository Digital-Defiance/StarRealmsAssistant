import React, { useState } from 'react';
import {
  Checkbox,
  Chip,
  Paper,
  Box,
  IconButton,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import SettingsIcon from '@mui/icons-material/Settings';
import { useGameContext } from '@/components/GameContext';
import SuperCapsText from '@/components/SuperCapsText';
import IncrementDecrementControl from '@/components/IncrementDecrementControl';
import { updatePlayerField } from '@/game/dominion-lib';
import { addLogEntry, fieldSubfieldToGameLogAction } from '@/game/dominion-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { PlayerFieldMap } from '@/game/types';
import { useAlert } from '@/components/AlertContext';
import '@/styles.scss';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  position: 'relative',
  transition: 'box-shadow 0.3s ease-in-out',
}));

const ColumnBox = styled(Box)({
  flex: 1,
  minWidth: 200,
  marginBottom: 2,
  display: 'flex',
  flexDirection: 'column',
});

const CenteredTitle = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 2,
});

const CorrectionCheckboxContainer = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 10,
  display: 'flex',
  alignItems: 'center',
});

const Player: React.FC = () => {
  const { gameState, setGameState } = useGameContext();
  const { showAlert } = useAlert();
  const [showNewTurnSettings, setShowNewTurnSettings] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isCorrection, setIsCorrection] = useState(false);

  if (gameState.selectedPlayerIndex === -1) {
    return (
      <StyledPaper elevation={3}>
        <Typography variant="h6">No player selected</Typography>
      </StyledPaper>
    );
  }

  const player = gameState.players[gameState.selectedPlayerIndex];
  const isCurrentPlayer = gameState.selectedPlayerIndex === gameState.currentPlayerIndex;

  // Apply a gray overlay and disable all controls when the game is paused
  const DisabledOverlay = styled(Box)(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
    zIndex: 1,
    display: isGamePaused() ? 'block' : 'none',
  }));

  const handleFieldChange = <T extends keyof PlayerFieldMap>(
    field: T,
    subfield: PlayerFieldMap[T],
    increment: number,
    linkedActionId?: string,
    victoryTrash?: boolean
  ): void => {
    const prevGame = deepClone<IGame>(gameState);
    try {
      const updatedGame = updatePlayerField(
        prevGame,
        prevGame.selectedPlayerIndex,
        field,
        subfield,
        increment,
        victoryTrash
      );
      const action = fieldSubfieldToGameLogAction(field, subfield, increment);
      addLogEntry(updatedGame, updatedGame.selectedPlayerIndex, action, {
        count: Math.abs(increment),
        correction: isCorrection,
        linkedActionId,
        trash: field === 'victory' && victoryTrash,
      });
      setGameState(updatedGame);
    } catch (error) {
      if (error instanceof Error) {
        showAlert('Could not increment', error.message);
      } else {
        showAlert('Could not increment', 'Unknown error');
      }
      setGameState(prevGame);
    }
  };

  const handleCombinedFieldChange = <T extends keyof PlayerFieldMap>(
    decrementField: T,
    decrementSubfield: PlayerFieldMap[T],
    decrement: number,
    incrementField: T,
    incrementSubfield: PlayerFieldMap[T],
    increment: number
  ): void => {
    const prevGame = deepClone<IGame>(gameState);
    try {
      // Perform the decrement action
      const tempGame = updatePlayerField(
        prevGame,
        prevGame.selectedPlayerIndex,
        decrementField,
        decrementSubfield,
        decrement
      );
      const decrementAction = fieldSubfieldToGameLogAction(
        decrementField,
        decrementSubfield,
        decrement
      );
      const decrementLogEntry = addLogEntry(
        tempGame,
        tempGame.selectedPlayerIndex,
        decrementAction,
        {
          count: Math.abs(decrement),
          correction: isCorrection,
        }
      );

      // Perform the increment action using the logEntry ID from the decrement action
      const updatedGame = updatePlayerField(
        tempGame,
        tempGame.selectedPlayerIndex,
        incrementField,
        incrementSubfield,
        increment
      );
      const incrementAction = fieldSubfieldToGameLogAction(
        incrementField,
        incrementSubfield,
        increment
      );
      addLogEntry(updatedGame, updatedGame.selectedPlayerIndex, incrementAction, {
        count: Math.abs(increment),
        correction: isCorrection,
        linkedActionId: decrementLogEntry.id,
      });

      // Update the actual game state with the final updated game
      setGameState(updatedGame);
    } catch (error) {
      if (error instanceof Error) {
        showAlert('Could not update field', error.message);
      } else {
        showAlert('Could not update field', 'Unknown error');
      }
      // Rollback to the previous game state
      setGameState(prevGame);
    }
  };

  const handleCorrectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCorrection(event.target.checked);
  };

  const showMats =
    gameState.options.mats.coffersVillagers ||
    gameState.options.mats.debt ||
    gameState.options.mats.favors;

  const showGlobalMats = gameState.options.expansions.risingSun && gameState.risingSun;

  const handleProphecyIncrease = () => {
    setGameState((prevState: IGame) => {
      if (prevState.risingSun && prevState.options.expansions.risingSun) {
        const newGameState = deepClone<IGame>(prevState);
        // prophecy is always triggered by the selected player, not the current player in case there is an off-turn action triggered by a defense, etc
        addLogEntry(newGameState, newGameState.selectedPlayerIndex, GameLogAction.ADD_PROPHECY, {
          count: 1,
        });
        newGameState.risingSun.prophecy.suns += 1;
        return newGameState;
      }
      return prevState;
    });
  };

  const handleProphecyDecrease = () => {
    setGameState((prevState: IGame) => {
      if (prevState.risingSun && prevState.options.expansions.risingSun) {
        if (prevState.risingSun.prophecy.suns - 1 < 0) {
          return prevState;
        }
        const newGameState = deepClone<IGame>(prevState);
        addLogEntry(newGameState, newGameState.selectedPlayerIndex, GameLogAction.REMOVE_PROPHECY, {
          count: 1,
        });

        newGameState.risingSun.prophecy.suns = Math.max(
          0,
          newGameState.risingSun.prophecy.suns - 1
        );
        return newGameState;
      }
      return prevState;
    });
  };

  const handleNewTurnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setShowNewTurnSettings(true);
  };

  const handleNewTurnClose = () => {
    setAnchorEl(null);
    setShowNewTurnSettings(false);
  };

  const isGamePaused = (): boolean => {
    const lastLogEntry = gameState.log.length > 0 ? gameState.log[gameState.log.length - 1] : null;
    return lastLogEntry !== null && lastLogEntry.action === GameLogAction.PAUSE;
  };

  return (
    <StyledPaper
      elevation={3}
      style={{
        border: `${isCurrentPlayer ? '4px' : '2px'} solid ${player.color}`,
        boxShadow: !isCurrentPlayer ? `0 0 10px ${player.color}, 0 0 20px ${player.color}` : 'none',
      }}
    >
      <DisabledOverlay />
      <Box sx={{ position: 'relative', pointerEvents: isGamePaused() ? 'none' : 'auto' }}>
        <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Tooltip
              title={
                isCurrentPlayer
                  ? `${player.name} is the current player`
                  : `${player.name} is not the current player`
              }
            >
              <Chip
                label={player.name.charAt(0).toUpperCase()}
                size="small"
                style={{
                  backgroundColor: player.color,
                  color: 'white',
                  fontWeight: isCurrentPlayer ? 'bold' : 'normal',
                  border: isCurrentPlayer ? '2px solid #000' : 'none',
                  marginRight: '8px',
                }}
              />
            </Tooltip>
            <SuperCapsText className={`typography-title`}>{player.name}</SuperCapsText>
          </Box>
          <IconButton onClick={handleNewTurnClick}>
            <SettingsIcon />
          </IconButton>
        </Box>
        <CorrectionCheckboxContainer>
          <Checkbox
            checked={isCorrection}
            onChange={handleCorrectionChange}
            inputProps={{ 'aria-label': 'Correction Checkbox' }}
          />
          <Tooltip title="Use to reverse accidental changes. They will be marked as corrections in the log.">
            <Typography variant="body2">Correction</Typography>
          </Tooltip>
        </CorrectionCheckboxContainer>
        {player && (
          <Box display="flex" flexWrap="wrap">
            <ColumnBox>
              <CenteredTitle>
                <Tooltip title="These values reset every turn">
                  <SuperCapsText className={`typography-large-title`}>Turn</SuperCapsText>
                </Tooltip>
              </CenteredTitle>
              <IncrementDecrementControl
                label="Actions"
                value={player.turn.actions}
                tooltip="Tracks the number of actions available this turn"
                onIncrement={() => handleFieldChange('turn', 'actions', 1)}
                onDecrement={() => {
                  // greatLeaderProphecy gives unlimited actions when the prophecy is empty
                  if (
                    !isCorrection &&
                    gameState.risingSun.greatLeaderProphecy &&
                    gameState.risingSun.prophecy.suns === 0
                  ) {
                    handleCombinedFieldChange('turn', 'actions', -1, 'turn', 'actions', 1);
                  } else {
                    handleFieldChange('turn', 'actions', -1);
                  }
                }}
              />
              <IncrementDecrementControl
                label="Buys"
                value={player.turn.buys}
                tooltip="Tracks the number of buys available this turn"
                onIncrement={() => handleFieldChange('turn', 'buys', 1)}
                onDecrement={() => handleFieldChange('turn', 'buys', -1)}
              />
              <IncrementDecrementControl
                label="Coins"
                value={player.turn.coins}
                tooltip="Tracks the number of coins played this turn"
                onIncrement={() => handleFieldChange('turn', 'coins', 1)}
                onDecrement={() => handleFieldChange('turn', 'coins', -1)}
              />
              <IncrementDecrementControl
                label="Cards"
                value={player.turn.cards}
                tooltip="Tracks the number of cards drawn this turn"
                onIncrement={() => handleFieldChange('turn', 'cards', 1)}
                onDecrement={() => handleFieldChange('turn', 'cards', -1)}
              />
              <IncrementDecrementControl
                label="Gains"
                value={player.turn.gains}
                tooltip="Tracks the number of cards gained this turn"
                onIncrement={() => handleFieldChange('turn', 'gains', 1)}
                onDecrement={() => handleFieldChange('turn', 'gains', -1)}
              />
            </ColumnBox>
            {(showMats || showGlobalMats) && (
              <ColumnBox>
                {showMats && (
                  <CenteredTitle>
                    <Tooltip title="These player mat values persist between turns">
                      <SuperCapsText className={`typography-large-title`}>Mats</SuperCapsText>
                    </Tooltip>
                  </CenteredTitle>
                )}
                {gameState.options.mats.coffersVillagers && (
                  <>
                    <IncrementDecrementControl
                      label="Coffers"
                      value={player.mats.coffers}
                      tooltip="Spending a coffer automatically gives a coin"
                      onIncrement={() => handleFieldChange('mats', 'coffers', 1)}
                      onDecrement={() => {
                        if (!isCorrection) {
                          // spending a coffer gives a coin
                          handleCombinedFieldChange('mats', 'coffers', -1, 'turn', 'coins', 1);
                        } else {
                          handleFieldChange('mats', 'coffers', -1);
                        }
                      }}
                    />
                    <IncrementDecrementControl
                      label="Villagers"
                      value={player.mats.villagers}
                      tooltip="Spending a villager automatically gives an action"
                      onIncrement={() => handleFieldChange('mats', 'villagers', 1)}
                      onDecrement={() => {
                        if (!isCorrection) {
                          // spending a villager gives an action
                          handleCombinedFieldChange('mats', 'villagers', -1, 'turn', 'actions', 1);
                        } else {
                          handleFieldChange('mats', 'villagers', -1);
                        }
                      }}
                    />
                  </>
                )}
                {gameState.options.mats.debt && (
                  <IncrementDecrementControl
                    label="Debt"
                    value={player.mats.debt}
                    tooltip="Tracks players' debt across turns"
                    onIncrement={() => handleFieldChange('mats', 'debt', 1)}
                    onDecrement={() => handleFieldChange('mats', 'debt', -1)}
                  />
                )}
                {gameState.options.mats.favors && (
                  <IncrementDecrementControl
                    label="Favors"
                    value={player.mats.favors}
                    tooltip="Tracks players' favors across turns"
                    onIncrement={() => handleFieldChange('mats', 'favors', 1)}
                    onDecrement={() => handleFieldChange('mats', 'favors', -1)}
                  />
                )}
                {showGlobalMats && (
                  <>
                    <Box sx={showMats ? { paddingTop: 2 } : {}}>
                      <CenteredTitle>
                        <Tooltip title="Global Mats affect all players and persist between turns">
                          <SuperCapsText className={`typography-large-title`}>
                            Global Mats
                          </SuperCapsText>
                        </Tooltip>
                      </CenteredTitle>
                    </Box>
                    {gameState.options.expansions.risingSun && gameState.risingSun && (
                      <IncrementDecrementControl
                        label="Prophecy"
                        value={gameState.risingSun.prophecy.suns}
                        tooltip="Rising Sun Prophecy affects all players and persists between turns"
                        onIncrement={handleProphecyIncrease}
                        onDecrement={handleProphecyDecrease}
                      />
                    )}
                  </>
                )}
              </ColumnBox>
            )}
            <ColumnBox sx={{ marginLeft: '10px' }}>
              <CenteredTitle>
                <Tooltip title="Victory points" arrow>
                  <SuperCapsText className={`typography-large-title`}>Victory</SuperCapsText>
                </Tooltip>
              </CenteredTitle>
              {gameState.options.curses && (
                <IncrementDecrementControl
                  label="Curses"
                  value={player.victory.curses}
                  tooltip="Tracks players' curses across turns"
                  onIncrement={() => handleFieldChange('victory', 'curses', 1)}
                  onDecrement={() => handleFieldChange('victory', 'curses', -1)}
                  onTrash={() => handleFieldChange('victory', 'curses', -1, undefined, true)}
                />
              )}
              <IncrementDecrementControl
                label="Estates"
                value={player.victory.estates}
                tooltip="Tracks players' estates owned across turns"
                onIncrement={() => handleFieldChange('victory', 'estates', 1)}
                onDecrement={() => handleFieldChange('victory', 'estates', -1)}
                onTrash={() => handleFieldChange('victory', 'estates', -1, undefined, true)}
              />
              <IncrementDecrementControl
                label="Duchies"
                value={player.victory.duchies}
                tooltip="Tracks players' duchies owned across turns"
                onIncrement={() => handleFieldChange('victory', 'duchies', 1)}
                onDecrement={() => handleFieldChange('victory', 'duchies', -1)}
                onTrash={() => handleFieldChange('victory', 'duchies', -1, undefined, true)}
              />
              <IncrementDecrementControl
                label="Provinces"
                value={player.victory.provinces}
                tooltip="Tracks players' provinces owned across turns"
                onIncrement={() => handleFieldChange('victory', 'provinces', 1)}
                onDecrement={() => handleFieldChange('victory', 'provinces', -1)}
                onTrash={() => handleFieldChange('victory', 'provinces', -1, undefined, true)}
              />
              {gameState.options.expansions.prosperity && (
                <IncrementDecrementControl
                  label="Colonies"
                  value={player.victory.colonies}
                  tooltip="Tracks players' colonies owned across turns"
                  onIncrement={() => handleFieldChange('victory', 'colonies', 1)}
                  onDecrement={() => handleFieldChange('victory', 'colonies', -1)}
                  onTrash={() => handleFieldChange('victory', 'colonies', -1, undefined, true)}
                />
              )}
              <IncrementDecrementControl
                label="Tokens"
                value={player.victory.tokens}
                tooltip="Tracks players' victory tokens owned across turns"
                onIncrement={() => handleFieldChange('victory', 'tokens', 1)}
                onDecrement={() => handleFieldChange('victory', 'tokens', -1)}
              />
              <IncrementDecrementControl
                label="Other"
                value={player.victory.other}
                tooltip="Tracks players' other victory points owned across turns"
                onIncrement={() => handleFieldChange('victory', 'other', 1)}
                onDecrement={() => handleFieldChange('victory', 'other', -1)}
              />
            </ColumnBox>
          </Box>
        )}
        <Popover
          open={showNewTurnSettings}
          anchorEl={anchorEl}
          onClose={handleNewTurnClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box p={2}>
            <CenteredTitle>
              <SuperCapsText className={`typography-title`}>Next Turn</SuperCapsText>
            </CenteredTitle>
            <IncrementDecrementControl
              label="Actions"
              value={player.newTurn.actions}
              tooltip="Number of actions available for new turns"
              onIncrement={() => handleFieldChange('newTurn', 'actions', 1)}
              onDecrement={() => handleFieldChange('newTurn', 'actions', -1)}
            />
            <IncrementDecrementControl
              label="Buys"
              value={player.newTurn.buys}
              tooltip="Number of buys available for new turns"
              onIncrement={() => handleFieldChange('newTurn', 'buys', 1)}
              onDecrement={() => handleFieldChange('newTurn', 'buys', -1)}
            />
            <IncrementDecrementControl
              label="Coins"
              value={player.newTurn.coins}
              tooltip="Number of coins available for new turns"
              onIncrement={() => handleFieldChange('newTurn', 'coins', 1)}
              onDecrement={() => handleFieldChange('newTurn', 'coins', -1)}
            />
            <IncrementDecrementControl
              label="Cards"
              value={player.newTurn.cards}
              tooltip="Number of cards available for new turns"
              onIncrement={() => handleFieldChange('newTurn', 'cards', 1)}
              onDecrement={() => handleFieldChange('newTurn', 'cards', -1)}
            />
          </Box>
        </Popover>
      </Box>
    </StyledPaper>
  );
};

export default Player;
