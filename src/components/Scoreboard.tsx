import React, { FC } from 'react';
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/system';
import SuperCapsText from '@/components/SuperCapsText';
import { calculateVictoryPoints } from '@/game/dominion-lib';
import { useGameContext } from '@/components/GameContext';
import { addLogEntry } from '@/game/dominion-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';

const TableText = styled(Typography)(() => ({
  fontFamily: 'TrajanProBold',
}));

const TableScore = styled(Typography)(() => ({
  fontFamily: 'Minion Pro Bold Caption',
  fontWeight: 'bold',
}));

const StyledButton = styled(Button)(() => ({
  fontFamily: 'TrajanProBold',
}));

const Scoreboard: FC = () => {
  const { gameState, setGameState } = useGameContext();

  if (!gameState) {
    return null; // or some fallback UI
  }

  const handlePlayerSelect = (index: number) => {
    setGameState((prevState: IGame) => {
      if (prevState.selectedPlayerIndex === index) {
        return prevState;
      }
      const newGame = deepClone<IGame>(prevState);
      addLogEntry(newGame, index, GameLogAction.SELECT_PLAYER, {
        prevPlayerIndex: prevState.selectedPlayerIndex,
      });
      newGame.selectedPlayerIndex = index;
      return newGame;
    });
  };

  const getCurrentPlayerIndex = () => {
    return (gameState.firstPlayerIndex + gameState.currentTurn - 1) % gameState.players.length;
  };

  const isGamePaused = (): boolean => {
    const lastLogEntry = gameState.log.length > 0 ? gameState.log[gameState.log.length - 1] : null;
    return lastLogEntry !== null && lastLogEntry.action === GameLogAction.PAUSE;
  };

  return (
    <Paper elevation={3} sx={{ padding: 0, maxWidth: 600 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableText className={`typography-text`}>Badge</TableText>
              </TableCell>
              <TableCell>
                <TableText className={`typography-text`}>Player</TableText>
              </TableCell>
              <TableCell>
                <TableText className={`typography-text`} align="right">
                  Score
                </TableText>
              </TableCell>
              <TableCell align="right">
                <TableText className={`typography-text`}>Turn: {gameState.currentTurn}</TableText>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gameState.players.map((player, index) => (
              <TableRow
                key={index}
                sx={{
                  backgroundColor:
                    index === gameState.selectedPlayerIndex ? 'rgba(0, 0, 0, 0.08)' : 'inherit',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <TableCell>
                  <Tooltip
                    title={
                      index === getCurrentPlayerIndex()
                        ? `${player.name} is the current player`
                        : ''
                    }
                  >
                    <Chip
                      label={player.name.charAt(0).toUpperCase()}
                      size="small"
                      style={{
                        backgroundColor: player.color,
                        color: 'white',
                        fontWeight: index === getCurrentPlayerIndex() ? 'bold' : 'normal',
                        border: index === getCurrentPlayerIndex() ? '2px solid #000' : 'none',
                      }}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell component="th" scope="row">
                  <SuperCapsText className={`typography-text`}>{player.name}</SuperCapsText>
                </TableCell>
                <TableCell align="right">
                  <TableScore className={`typography-title`}>
                    {calculateVictoryPoints(player)}
                  </TableScore>
                </TableCell>
                <TableCell align="right">
                  <StyledButton
                    variant="contained"
                    size="small"
                    onClick={() => handlePlayerSelect(index)}
                    disabled={isGamePaused()}
                  >
                    <TableText className={`typography-text`}>Select</TableText>
                  </StyledButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Scoreboard;
