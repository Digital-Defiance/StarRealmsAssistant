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
import { ILogEntry } from '@/game/interfaces/log-entry';
import { updatePlayerField } from '@/game/dominion-lib';
import { addLogEntry, victoryFieldToGameLogAction } from '@/game/dominion-lib-log';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { PlayerFieldMap } from '@/game/types';
import { useAlert } from '@/components/AlertContext';
import { FailedAddLogEntryError } from '@/game/errors/failed-add-log';
import '@/styles.scss';

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
  bottom: 10,
  left: 30,
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

  const handleFieldChange = <T extends keyof PlayerFieldMap>(
    field: T,
    subfield: PlayerFieldMap[T],
    increment: number,
    linkedActionId?: string
  ): ILogEntry => {
    let logEntry: ILogEntry | undefined;
    setGameState((prevState) => {
      try {
        const updatedGame = updatePlayerField(
          prevState,
          prevState.selectedPlayerIndex,
          field,
          subfield,
          increment
        );
        if (!updatedGame) {
          return prevState;
        }
        const action = victoryFieldToGameLogAction(field, subfield, increment);
        logEntry = addLogEntry(updatedGame, updatedGame.selectedPlayerIndex, action, {
          count: Math.abs(increment),
          correction: isCorrection,
          linkedActionId,
        });
        return updatedGame;
      } catch (error) {
        if (error instanceof Error) {
          showAlert('Could not increment', error.message);
        } else {
          showAlert('Could not increment', 'Unknown error');
        }
        return prevState;
      }
    });
    if (!logEntry) {
      throw new FailedAddLogEntryError();
    }
    return logEntry;
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
    setGameState((prevState) => {
      if (prevState.risingSun && prevState.options.expansions.risingSun) {
        const newGameState = { ...prevState };
        // prophecy is always triggered by the selected player, not the current player in case there is an off-turn action triggered by a defense, etc
        addLogEntry(
          newGameState,
          newGameState.selectedPlayerIndex,
          GameLogActionWithCount.ADD_PROPHECY,
          { count: 1 }
        );
        newGameState.risingSun.prophecy.suns += 1;
        return newGameState;
      }
      return prevState;
    });
  };

  const handleProphecyDecrease = () => {
    setGameState((prevState) => {
      if (prevState.risingSun && prevState.options.expansions.risingSun) {
        if (prevState.risingSun.prophecy.suns - 1 < 0) {
          return prevState;
        }
        const newGameState = { ...prevState };
        addLogEntry(
          newGameState,
          newGameState.selectedPlayerIndex,
          GameLogActionWithCount.REMOVE_PROPHECY,
          { count: 1 }
        );

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

  return (
    <StyledPaper
      elevation={3}
      style={{
        border: `${isCurrentPlayer ? '4px' : '2px'} solid ${player.color}`,
        boxShadow: !isCurrentPlayer ? `0 0 10px ${player.color}, 0 0 20px ${player.color}` : 'none',
      }}
    >
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
              onIncrement={() => handleFieldChange('turn', 'actions', 1)}
              onDecrement={() => {
                const record = handleFieldChange('turn', 'actions', -1);
                if (
                  gameState.risingSun.greatLeaderProphecy &&
                  gameState.risingSun.prophecy.suns === 0
                ) {
                  handleFieldChange('turn', 'actions', 1, record.id);
                }
              }}
            />
            <IncrementDecrementControl
              label="Buys"
              value={player.turn.buys}
              onIncrement={() => handleFieldChange('turn', 'buys', 1)}
              onDecrement={() => handleFieldChange('turn', 'buys', -1)}
            />
            <IncrementDecrementControl
              label="Coins"
              value={player.turn.coins}
              onIncrement={() => handleFieldChange('turn', 'coins', 1)}
              onDecrement={() => handleFieldChange('turn', 'coins', -1)}
            />
          </ColumnBox>
          {(showMats || showGlobalMats) && (
            <ColumnBox>
              <CenteredTitle>
                <Tooltip title="These player mat values persist between turns">
                  <SuperCapsText className={`typography-large-title`}>Mats</SuperCapsText>
                </Tooltip>
              </CenteredTitle>
              {gameState.options.mats.coffersVillagers && (
                <>
                  <IncrementDecrementControl
                    label="Coffers"
                    value={player.mats.coffers}
                    tooltip="Spending a coffer automatically gives a coin"
                    onIncrement={() => handleFieldChange('mats', 'coffers', 1)}
                    onDecrement={() => {
                      // spending a coffer gives a coin
                      const record = handleFieldChange('mats', 'coffers', -1);
                      handleFieldChange('turn', 'coins', 1, record.id);
                    }}
                  />
                  <IncrementDecrementControl
                    label="Villagers"
                    value={player.mats.villagers}
                    tooltip="Spending a villager automatically gives an action"
                    onIncrement={() => handleFieldChange('mats', 'villagers', 1)}
                    onDecrement={() => {
                      // spending a villager gives an action
                      const record = handleFieldChange('mats', 'villagers', -1);
                      handleFieldChange('turn', 'actions', 1, record.id);
                    }}
                  />
                </>
              )}
              {gameState.options.mats.debt && (
                <IncrementDecrementControl
                  label="Debt"
                  value={player.mats.debt}
                  onIncrement={() => handleFieldChange('mats', 'debt', 1)}
                  onDecrement={() => handleFieldChange('mats', 'debt', -1)}
                />
              )}
              {gameState.options.mats.favors && (
                <IncrementDecrementControl
                  label="Favors"
                  value={player.mats.favors}
                  onIncrement={() => handleFieldChange('mats', 'favors', 1)}
                  onDecrement={() => handleFieldChange('mats', 'favors', -1)}
                />
              )}
              {showGlobalMats && (
                <>
                  <Box sx={{ paddingTop: 2 }}>
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
          <ColumnBox>
            <CenteredTitle>
              <Tooltip title="Victory points" arrow>
                <SuperCapsText className={`typography-large-title`}>Victory</SuperCapsText>
              </Tooltip>
            </CenteredTitle>
            <IncrementDecrementControl
              label="Estates"
              value={player.victory.estates}
              onIncrement={() => handleFieldChange('victory', 'estates', 1)}
              onDecrement={() => handleFieldChange('victory', 'estates', -1)}
            />
            <IncrementDecrementControl
              label="Duchies"
              value={player.victory.duchies}
              onIncrement={() => handleFieldChange('victory', 'duchies', 1)}
              onDecrement={() => handleFieldChange('victory', 'duchies', -1)}
            />
            <IncrementDecrementControl
              label="Provinces"
              value={player.victory.provinces}
              onIncrement={() => handleFieldChange('victory', 'provinces', 1)}
              onDecrement={() => handleFieldChange('victory', 'provinces', -1)}
            />
            {gameState.options.expansions.prosperity && (
              <IncrementDecrementControl
                label="Colonies"
                value={player.victory.colonies}
                onIncrement={() => handleFieldChange('victory', 'colonies', 1)}
                onDecrement={() => handleFieldChange('victory', 'colonies', -1)}
              />
            )}
            <IncrementDecrementControl
              label="Tokens"
              value={player.victory.tokens}
              onIncrement={() => handleFieldChange('victory', 'tokens', 1)}
              onDecrement={() => handleFieldChange('victory', 'tokens', -1)}
            />
            <IncrementDecrementControl
              label="Other"
              value={player.victory.other}
              onIncrement={() => handleFieldChange('victory', 'other', 1)}
              onDecrement={() => handleFieldChange('victory', 'other', -1)}
            />
            {gameState.options.curses && (
              <IncrementDecrementControl
                label="Curses"
                value={player.victory.curses}
                onIncrement={() => handleFieldChange('victory', 'curses', 1)}
                onDecrement={() => handleFieldChange('victory', 'curses', -1)}
              />
            )}
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
            onIncrement={() => handleFieldChange('newTurn', 'actions', 1)}
            onDecrement={() => handleFieldChange('newTurn', 'actions', -1)}
          />
          <IncrementDecrementControl
            label="Buys"
            value={player.newTurn.buys}
            onIncrement={() => handleFieldChange('newTurn', 'buys', 1)}
            onDecrement={() => handleFieldChange('newTurn', 'buys', -1)}
          />
          <IncrementDecrementControl
            label="Coins"
            value={player.newTurn.coins}
            onIncrement={() => handleFieldChange('newTurn', 'coins', 1)}
            onDecrement={() => handleFieldChange('newTurn', 'coins', -1)}
          />
        </Box>
      </Popover>
    </StyledPaper>
  );
};

export default Player;
