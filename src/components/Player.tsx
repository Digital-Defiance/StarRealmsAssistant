import React, { useState } from 'react';
import {
  Checkbox,
  Paper,
  Box,
  IconButton,
  Popover,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/system';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import SettingsIcon from '@mui/icons-material/Settings';
import { useGameContext } from '@/components/GameContext';
import SuperCapsText from '@/components/SuperCapsText';
import IncrementDecrementControl from '@/components/IncrementDecrementControl';
import { TITLE_SIZE } from '@/components/constants';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { updatePlayerField } from '@/game/dominion-lib';
import { victoryFieldToGameLogAction } from '@/game/dominion-lib-log';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { PlayerFieldMap } from '@/game/types';
import { useAlert } from '@/components/AlertContext';
import { FailedAddLogEntryError } from '@/game/errors/failed-add-log';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: 5,
  margin: theme.spacing(2),
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

interface PlayerProps {
  addLogEntry: (
    playerIndex: number,
    action: GameLogActionWithCount,
    count?: number,
    correction?: boolean,
    linkedAction?: string
  ) => ILogEntry;
}

const Player: React.FC<PlayerProps> = ({ addLogEntry }) => {
  const theme = useTheme();
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
    linkedAction?: string
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
        logEntry = addLogEntry(
          prevState.selectedPlayerIndex,
          action,
          Math.abs(increment),
          isCorrection,
          linkedAction
        );
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
    addLogEntry(gameState.selectedPlayerIndex, GameLogActionWithCount.ADD_PROPHECY, 1);
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const newGameState = { ...prevState };
      if (newGameState.risingSun && newGameState.options.expansions.risingSun) {
        newGameState.risingSun.prophecy.suns += 1;
      }
      return newGameState;
    });
  };

  const handleProphecyDecrease = () => {
    addLogEntry(gameState.selectedPlayerIndex, GameLogActionWithCount.REMOVE_PROPHECY, 1);
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const newGameState = { ...prevState };
      if (newGameState.risingSun && newGameState.options.expansions.risingSun) {
        if (newGameState.risingSun.prophecy.suns - 1 < 0) {
          return prevState;
        }
        newGameState.risingSun.prophecy.suns = Math.max(
          0,
          newGameState.risingSun.prophecy.suns - 1
        );
      }
      return newGameState;
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
        border: isCorrection
          ? `2px solid ${theme.palette.error.main}`
          : !isCurrentPlayer
          ? `2px solid ${theme.palette.primary.main}`
          : 'none',
      }}
    >
      <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          {isCurrentPlayer && <ArrowRightIcon sx={{ mr: 1 }} />}
          <SuperCapsText fontSize={TITLE_SIZE}>{player.name}</SuperCapsText>
        </Box>
        <IconButton onClick={handleNewTurnClick}>
          <SettingsIcon />
        </IconButton>
      </Box>
      {player && (
        <Box display="flex" flexWrap="wrap">
          <ColumnBox>
            <CenteredTitle>
              <Tooltip title="These values reset every turn">
                <SuperCapsText fontSize={TITLE_SIZE}>Turn</SuperCapsText>
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
                  <SuperCapsText fontSize={TITLE_SIZE}>Mats</SuperCapsText>
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
                        <SuperCapsText fontSize={TITLE_SIZE}>Global Mats</SuperCapsText>
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
                <SuperCapsText fontSize={TITLE_SIZE}>Victory</SuperCapsText>
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
            <SuperCapsText fontSize={TITLE_SIZE}>Next Turn</SuperCapsText>
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
      <Box position="absolute" bottom={10} left={30} display="flex" alignItems="center">
        <Checkbox
          checked={isCorrection}
          onChange={handleCorrectionChange}
          inputProps={{ 'aria-label': 'Correction Checkbox' }}
        />
        <Typography variant="body2">Correction</Typography>
      </Box>
    </StyledPaper>
  );
};

export default Player;
