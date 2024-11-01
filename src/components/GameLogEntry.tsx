import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; // Icon for corrections
import LinkIcon from '@mui/icons-material/Link';
import UndoIcon from '@mui/icons-material/Undo';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGameContext } from '@/components/GameContext';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { canUndoAction, undoAction } from '@/game/dominion-lib-undo';
import { formatTimeSpan, logEntryToString } from '@/game/dominion-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { AdjustmentActions } from '@/game/constants';
import ColoredPlayerName from '@/components/ColoredPlayerName';
import { getAdjustedDurationFromCacheByIndex } from '@/game/dominion-lib-time';

interface GameLogEntryProps {
  logIndex: number;
  entry: ILogEntry;
  hasLinkedAction: boolean;
}

const GameLogEntry: React.FC<GameLogEntryProps> = ({ logIndex, entry, hasLinkedAction }) => {
  const { gameState, setGameState } = useGameContext();
  const [openUndoDialog, setOpenUndoDialog] = useState(false);

  const handleUndoClick = () => {
    setOpenUndoDialog(true);
  };

  const handleUndoConfirm = () => {
    const { game: newGame, success } = undoAction(gameState, logIndex);
    if (success) {
      setGameState(newGame);
    }
    setOpenUndoDialog(false);
  };

  const handleUndoCancel = () => {
    setOpenUndoDialog(false);
  };

  const formatDate = (timestamp: Date) => {
    const now = new Date();
    const isToday = timestamp.toDateString() === now.toDateString();

    const timeString = timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (isToday) {
      return timeString;
    } else {
      const dateString = timestamp.toLocaleDateString([], {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      return `${dateString} ${timeString}`;
    }
  };

  const actionText = logEntryToString(entry);

  const relevantPlayer = entry.playerIndex > -1 ? gameState.players[entry.playerIndex] : undefined;
  const isActivePlayer = entry.playerIndex === entry.currentPlayerIndex;
  const isNewTurn = entry.action === GameLogAction.NEXT_TURN;
  const isAttributeChange = AdjustmentActions.includes(entry.action);
  const isAttributeChangeOutOfTurn = isAttributeChange && !isActivePlayer;
  const isNotTriggeredByPlayer = [GameLogAction.SELECT_PLAYER, GameLogAction.NEXT_TURN].includes(
    entry.action
  );

  if (entry.playerIndex > -1 && !gameState.players[entry.playerIndex]) {
    console.warn(`Player not found for index ${entry.playerIndex}`, {
      entry,
      gamePlayersLength: gameState.players.length,
    });
  }

  return (
    <>
      <TableRow
        style={{
          backgroundColor: isNewTurn ? '#e3f2fd' : 'inherit',
          transition: 'background-color 0.3s',
        }}
      >
        <TableCell style={{ width: '15%' }}>
          <Typography variant="caption">{formatDate(entry.timestamp)}</Typography>
        </TableCell>
        <TableCell style={{ width: '15%' }}>
          <Typography variant="caption">
            {formatTimeSpan(getAdjustedDurationFromCacheByIndex(gameState, logIndex) ?? 0)}
          </Typography>
        </TableCell>
        <TableCell style={{ width: '60%' }}>
          <Box display="flex" alignItems="center">
            {relevantPlayer && (
              <Chip
                label={relevantPlayer.name.charAt(0).toUpperCase()}
                size="small"
                style={{
                  backgroundColor: relevantPlayer !== undefined ? relevantPlayer.color : 'gray',
                  color: 'white',
                  marginRight: '8px',
                  fontWeight: isActivePlayer ? 'bold' : 'normal',
                  border: isActivePlayer ? '2px solid #000' : 'none',
                }}
              />
            )}
            <Box display="flex" alignItems="center" flexGrow={1}>
              {relevantPlayer !== undefined && !isNotTriggeredByPlayer && (
                <ColoredPlayerName player={relevantPlayer} marginDirection="right" />
              )}
              <Typography variant="body2" component="span">
                {actionText}
              </Typography>
              {isNotTriggeredByPlayer && relevantPlayer !== undefined && (
                <ColoredPlayerName player={relevantPlayer} marginDirection="left" />
              )}
              {[GameLogAction.START_GAME, GameLogAction.NEXT_TURN].includes(entry.action) &&
                `\u00A0(\u00A0${entry.turn}\u00A0)`}
              {entry.trash === true && (
                <Tooltip title="The card was trashed" arrow>
                  <DeleteIcon
                    fontSize="small"
                    titleAccess="Card was trashed"
                    style={{ marginLeft: '8px' }}
                  />
                </Tooltip>
              )}
              {isAttributeChangeOutOfTurn && (
                <ChangeCircleIcon
                  fontSize="small"
                  style={{ marginLeft: '8px', color: '#ff9800' }}
                  titleAccess="Attribute changed outside of player's turn"
                />
              )}
              {entry.correction && (
                <Tooltip title="This entry was a correction" arrow>
                  <EditIcon fontSize="small" style={{ marginLeft: '8px', color: '#ff9800' }} />
                </Tooltip>
              )}
            </Box>
          </Box>
        </TableCell>
        <TableCell style={{ width: '10%', textAlign: 'right' }}>
          {(hasLinkedAction || entry.linkedActionId) && (
            <LinkIcon fontSize="small" color="action" />
          )}
          {canUndoAction(gameState, logIndex) && (
            <IconButton onClick={handleUndoClick} size="small">
              <Tooltip title="Undo this entry">
                <UndoIcon fontSize="small" />
              </Tooltip>
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <Dialog
        open={openUndoDialog}
        onClose={handleUndoCancel}
        aria-labelledby="undo-dialog-title"
        aria-describedby="undo-dialog-description"
      >
        <DialogTitle id="undo-dialog-title">Confirm Undo</DialogTitle>
        <DialogContent>
          <DialogContentText id="undo-dialog-description">
            Are you sure you want to undo this action?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUndoCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUndoConfirm} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GameLogEntry;
