import React, { ChangeEvent, FC, MouseEvent, useState } from 'react';
import {
  Checkbox,
  Chip,
  Paper,
  Box,
  Tooltip,
  Typography,
  Popover,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import SettingsIcon from '@mui/icons-material/Settings';
import { styled } from '@mui/system';
import { useGameContext } from '@/components/GameContext';
import SuperCapsText from '@/components/SuperCapsText';
import IncrementDecrementControl from '@/components/IncrementDecrementControl';
import { getPlayerLabel, updatePlayerField } from '@/game/starrealms-lib';
import {
  addLogEntry,
  checkPlayerEliminationAndGameEnd,
  fieldSubfieldToGameLogAction,
  getMasterActionId,
  getTurnAdjustments,
  groupTurnAdjustmentsByPlayer,
} from '@/game/starrealms-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { PlayerFieldMap } from '@/game/types';
import { useAlert } from '@/components/AlertContext';
import '@/styles.scss';
import { IGame } from '@/game/interfaces/game';
import { PlayerChip } from './PlayerChip';
import { ILogEntry } from '@/game/interfaces/log-entry';

const OuterContainer = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(8), // Ensure enough space at the bottom
  position: 'relative', // Ensure absolute positioning works within this container
  overflowY: 'auto', // Make it scrollable
}));

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

interface PlayerProps {
  containerHeight: number;
}
const PlayerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: theme.spacing(1),
}));

const HeaderLeftSection = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: 1,
});

const HeaderRightSection = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const CheckboxesContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginLeft: 'auto',
  marginRight: '8px',
});

const Player: FC<PlayerProps> = ({ containerHeight }) => {
  const { gameState, setGameState } = useGameContext();
  const { showAlert } = useAlert();
  const [showNewTurnSettings, setShowNewTurnSettings] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isCorrection, setIsCorrection] = useState(false);
  const [linkChanges, setLinkChanges] = useState(false);
  const [linkChangeId, setLinkChangeId] = useState<string | undefined>(undefined);

  if (gameState.selectedPlayerIndex === -1) {
    return (
      <StyledPaper elevation={3}>
        <Typography variant="h6">No player selected</Typography>
      </StyledPaper>
    );
  }

  const player = gameState.players[gameState.selectedPlayerIndex];
  const isCurrentPlayer = gameState.selectedPlayerIndex === gameState.currentPlayerIndex;
  const turnAdjustments = getTurnAdjustments(gameState, gameState.currentTurn);
  const groupedAdjustmentsByPlayer = groupTurnAdjustmentsByPlayer(turnAdjustments);
  const playerAdjustments = groupedAdjustmentsByPlayer.get(gameState.selectedPlayerIndex) ?? [];
  const authorityAdjustments = playerAdjustments.filter(
    (adj) => adj.field === 'authority' && adj.subfield === 'authority'
  );
  const assimilationAdjustments = playerAdjustments.filter(
    (adj) => adj.field === 'authority' && adj.subfield === 'assimilation'
  );
  // subtract combat from current player's authority, limited by available authority
  const currentPlayerCombatToSubtract = Math.min(
    gameState.players[gameState.currentPlayerIndex].turn.combat,
    gameState.players[gameState.selectedPlayerIndex].authority.authority
  );

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

  const handleFieldChangeForCurrentPlayer = <T extends keyof PlayerFieldMap>(
    field: T,
    subfield: PlayerFieldMap[T],
    increment: number,
    linkedActionId?: string
  ): void => {
    setGameState((prevGame: IGame) => {
      try {
        const updatedGame = updatePlayerField(
          prevGame,
          prevGame.currentPlayerIndex,
          field,
          subfield,
          increment
        );
        const action = fieldSubfieldToGameLogAction(field, subfield, increment);
        addLogEntry(updatedGame, updatedGame.currentPlayerIndex, action, {
          count: Math.abs(increment),
          correction: isCorrection,
          linkedActionId,
          scrap: false,
        });
        checkPlayerEliminationAndGameEnd(updatedGame);
        return updatedGame;
      } catch (error) {
        if (error instanceof Error) {
          showAlert('Could not increment', error.message);
        } else {
          showAlert('Could not increment', 'Unknown error');
        }
        return prevGame;
      }
    });
  };

  const handleFieldChange = <T extends keyof PlayerFieldMap>(
    field: T,
    subfield: PlayerFieldMap[T],
    increment: number,
    linkedActionId?: string,
    skipEndGame = false
  ): ILogEntry | undefined => {
    let logEntry: ILogEntry | undefined;
    setGameState((prevGame: IGame) => {
      try {
        const updatedGame = updatePlayerField(
          prevGame,
          prevGame.selectedPlayerIndex,
          field,
          subfield,
          increment
        );
        const action = fieldSubfieldToGameLogAction(field, subfield, increment);
        logEntry = addLogEntry(updatedGame, updatedGame.selectedPlayerIndex, action, {
          count: Math.abs(increment),
          correction: isCorrection,
          linkedActionId,
          scrap: false,
        });
        if (!skipEndGame) {
          checkPlayerEliminationAndGameEnd(updatedGame);
        }
        return updatedGame;
      } catch (error) {
        if (error instanceof Error) {
          showAlert('Could not increment', error.message);
        } else {
          showAlert('Could not increment', 'Unknown error');
        }
        return prevGame;
      }
    });
    return logEntry;
  };

  const handleCorrectionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsCorrection(event.target.checked);
  };

  const handleLinkChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLinkChanges(event.target.checked);
    if (event.target.checked) {
      setLinkChangeId(
        gameState.log.length > 0
          ? getMasterActionId(gameState.log[gameState.log.length - 1])
          : undefined
      );
    } else {
      setLinkChangeId(undefined);
    }
  };

  const isGamePaused = (): boolean => {
    const lastLogEntry = gameState.log.length > 0 ? gameState.log[gameState.log.length - 1] : null;
    return lastLogEntry !== null && lastLogEntry.action === GameLogAction.PAUSE;
  };

  const handleNewTurnClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setShowNewTurnSettings(true);
  };

  const handleNewTurnClose = () => {
    setAnchorEl(null);
    setShowNewTurnSettings(false);
  };

  return (
    <OuterContainer
      style={{
        maxHeight: `${containerHeight}px`,
      }}
    >
      <StyledPaper
        elevation={3}
        style={{
          border: `${isCurrentPlayer ? '4px' : '2px'} solid ${player.color}`,
          boxShadow: !isCurrentPlayer
            ? `0 0 10px ${player.color}, 0 0 20px ${player.color}`
            : 'none',
        }}
      >
        <DisabledOverlay />
        <Box sx={{ position: 'relative', pointerEvents: isGamePaused() ? 'none' : 'auto' }}>
          <PlayerHeader>
            <HeaderLeftSection>
              <Tooltip
                title={
                  isCurrentPlayer
                    ? `${player.name} is the current player`
                    : `${player.name} is not the current player`
                }
              >
                <PlayerChip
                  label={getPlayerLabel(gameState.players, gameState.selectedPlayerIndex)}
                  size="small"
                  style={{
                    backgroundColor: player.color,
                    color: 'white',
                    fontWeight: isCurrentPlayer ? 'bold' : 'normal',
                    border: isCurrentPlayer ? '2px solid #000' : 'none',
                    marginRight: '8px',
                    minWidth: '30px',
                  }}
                />
              </Tooltip>
              <SuperCapsText className={`typography-title`}>{player.name}</SuperCapsText>
            </HeaderLeftSection>
            <CheckboxesContainer>
              <Tooltip title="Use to reverse accidental changes. They will be marked as corrections in the log.">
                <Checkbox
                  checked={isCorrection}
                  onChange={handleCorrectionChange}
                  inputProps={{ 'aria-label': 'Correction Checkbox' }}
                  icon={<EditIcon />}
                  checkedIcon={<EditIcon color="primary" />}
                />
              </Tooltip>
              <Tooltip title="Link new changes to the previous change">
                <Checkbox
                  checked={linkChanges}
                  onChange={handleLinkChange}
                  disabled={gameState.log.length <= 1}
                  inputProps={{ 'aria-label': 'Link Checkbox' }}
                  icon={<LinkIcon />}
                  checkedIcon={<LinkIcon color="primary" />}
                />
              </Tooltip>
            </CheckboxesContainer>
            <HeaderRightSection>
              <IconButton onClick={handleNewTurnClick} aria-label="New Turn Settings">
                <SettingsIcon />
              </IconButton>
            </HeaderRightSection>
          </PlayerHeader>
          {player && (
            <Box display="flex" flexWrap="wrap">
              <ColumnBox>
                <CenteredTitle>
                  <Tooltip title="These values reset every turn">
                    <SuperCapsText className={`typography-large-title`}>Turn</SuperCapsText>
                  </Tooltip>
                </CenteredTitle>
                <IncrementDecrementControl
                  label="Trade"
                  value={player.turn.trade}
                  tooltip="Tracks the number of buys available this turn"
                  onIncrement={() => handleFieldChange('turn', 'trade', 1, linkChangeId)}
                  onDecrement={() => handleFieldChange('turn', 'trade', -1, linkChangeId)}
                />
                <IncrementDecrementControl
                  label="Combat"
                  value={player.turn.combat}
                  tooltip="Tracks the number of coins played this turn"
                  onIncrement={() => handleFieldChange('turn', 'combat', 1, linkChangeId)}
                  onDecrement={() => handleFieldChange('turn', 'combat', -1, linkChangeId)}
                />
                {gameState.options.trackCardCounts && (
                  <IncrementDecrementControl
                    label="Cards"
                    value={player.turn.cards}
                    tooltip="Tracks the number of cards drawn this turn"
                    onIncrement={() => handleFieldChange('turn', 'cards', 1, linkChangeId)}
                    onDecrement={() => handleFieldChange('turn', 'cards', -1, linkChangeId)}
                  />
                )}
                {gameState.options.trackCardGains && (
                  <IncrementDecrementControl
                    label="Gains"
                    value={player.turn.gains}
                    tooltip="Tracks the number of cards gained this turn"
                    onIncrement={() => handleFieldChange('turn', 'gains', 1, linkChangeId)}
                    onDecrement={() => handleFieldChange('turn', 'gains', -1, linkChangeId)}
                  />
                )}
                {gameState.options.trackDiscard && (
                  <IncrementDecrementControl
                    label="Discard"
                    value={player.turn.discard}
                    tooltip="Tracks the number of cards discarded this turn"
                    onIncrement={() => handleFieldChange('turn', 'discard', 1, linkChangeId)}
                    onDecrement={() => handleFieldChange('turn', 'discard', -1, linkChangeId)}
                  />
                )}
              </ColumnBox>
              <ColumnBox sx={{ marginLeft: '10px' }}>
                <CenteredTitle>
                  <Tooltip title="Authority" arrow>
                    <SuperCapsText className={`typography-large-title`}>Authority</SuperCapsText>
                  </Tooltip>
                </CenteredTitle>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <IncrementDecrementControl
                      label="Authority"
                      value={player.authority.authority}
                      tooltip="Tracks players' authority across turns"
                      onIncrement={() =>
                        handleFieldChange('authority', 'authority', 1, linkChangeId)
                      }
                      onBatchDecrement={
                        gameState.selectedPlayerIndex !== gameState.currentPlayerIndex &&
                        currentPlayerCombatToSubtract > 0
                          ? () => {
                              const log = handleFieldChange(
                                'authority',
                                'authority',
                                currentPlayerCombatToSubtract * -1,
                                linkChangeId,
                                true
                              );
                              handleFieldChangeForCurrentPlayer(
                                'turn',
                                'combat',
                                currentPlayerCombatToSubtract * -1,
                                linkChangeId ?? log?.id
                              );
                            }
                          : undefined
                      }
                      onDecrement={() =>
                        handleFieldChange('authority', 'authority', -1, linkChangeId)
                      }
                    />
                  </Box>
                  <Box sx={{ width: 60, display: 'flex', justifyContent: 'center' }}>
                    {authorityAdjustments.length > 0 && (
                      <Chip
                        label={
                          authorityAdjustments[0].increment > 0
                            ? `+${authorityAdjustments[0].increment}`
                            : authorityAdjustments[0].increment
                        }
                        color={authorityAdjustments[0].increment > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
                {player.boss && gameState.options.trackAssimilation && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <IncrementDecrementControl
                        label="Assimilation"
                        value={player.authority.assimilation}
                        tooltip="Tracks Boss Assimilation across turns"
                        onIncrement={() =>
                          handleFieldChange('authority', 'assimilation', 1, linkChangeId)
                        }
                        onDecrement={() =>
                          handleFieldChange('authority', 'assimilation', -1, linkChangeId)
                        }
                      />
                    </Box>
                    <Box sx={{ width: 60, display: 'flex', justifyContent: 'center' }}>
                      {assimilationAdjustments.length > 0 && (
                        <Chip
                          label={
                            assimilationAdjustments[0].increment > 0
                              ? `+${assimilationAdjustments[0].increment}`
                              : assimilationAdjustments[0].increment
                          }
                          color={assimilationAdjustments[0].increment > 0 ? 'success' : 'error'}
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
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
                label="Trade"
                value={player.newTurn.trade}
                tooltip="Number of actions available for new turns"
                onIncrement={() => handleFieldChange('newTurn', 'trade', 1, linkChangeId)}
                onDecrement={() => handleFieldChange('newTurn', 'trade', -1, linkChangeId)}
              />
              <IncrementDecrementControl
                label="Combat"
                value={player.newTurn.combat}
                tooltip="Number of buys available for new turns"
                onIncrement={() => handleFieldChange('newTurn', 'combat', 1, linkChangeId)}
                onDecrement={() => handleFieldChange('newTurn', 'combat', -1, linkChangeId)}
              />
              {gameState.options.trackCardCounts && (
                <IncrementDecrementControl
                  label="Cards"
                  value={player.newTurn.cards}
                  tooltip="Number of cards available for new turns"
                  onIncrement={() => handleFieldChange('newTurn', 'cards', 1, linkChangeId)}
                  onDecrement={() => handleFieldChange('newTurn', 'cards', -1, linkChangeId)}
                />
              )}
              {gameState.options.trackDiscard && (
                <IncrementDecrementControl
                  label="Discard"
                  value={player.newTurn.discard}
                  tooltip="Number of cards to discard for new turns"
                  onIncrement={() => handleFieldChange('newTurn', 'discard', 1, linkChangeId)}
                  onDecrement={() => handleFieldChange('newTurn', 'discard', -1, linkChangeId)}
                />
              )}
            </Box>
          </Popover>
        </Box>
      </StyledPaper>
    </OuterContainer>
  );
};

export default Player;
