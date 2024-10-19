import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import { styled } from '@mui/system';
import SuperCapsText from '@/components/SuperCapsText';
import { calculateVictoryPoints } from '@/game/dominion-lib';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useGameContext } from '@/components/GameContext';
import { addLogEntry } from '@/game/dominion-lib-log';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import theme from '@/components/theme';

const StyledTableCell = styled(TableCell)(({ theme }: { theme: Theme }) => ({
  fontFamily: 'TrajanProBold',
  fontSize: theme.sizes.text,
}));

const StyledScoreCell = styled(TableCell)(({ theme }: { theme: Theme }) => ({
  fontFamily: 'TrajanProBold',
  fontSize: theme.sizes.title,
  fontWeight: 'bold',
}));

const StyledButton = styled(Button)(({ theme }: { theme: Theme }) => ({
  fontFamily: 'TrajanProBold',
  fontSize: theme.sizes.text,
}));

const Scoreboard: React.FC = () => {
  const { gameState, setGameState } = useGameContext();

  if (!gameState) {
    return null; // or some fallback UI
  }

  const handlePlayerSelect = (index: number) => {
    setGameState((prevState) => {
      addLogEntry(prevState, index, GameLogActionWithCount.SELECT_PLAYER, {
        prevPlayerIndex: prevState.selectedPlayerIndex,
        newPlayerIndex: index,
      });
      return { ...prevState, selectedPlayerIndex: index };
    });
  };

  const getCurrentPlayerIndex = () => {
    return (gameState.firstPlayerIndex + gameState.currentTurn - 1) % gameState.players.length;
  };

  return (
    <Paper elevation={3} sx={{ padding: 0, maxWidth: 600 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell theme={theme}>Current</StyledTableCell>
              <StyledTableCell theme={theme}>Player</StyledTableCell>
              <StyledTableCell theme={theme} align="right">
                Score
              </StyledTableCell>
              <StyledTableCell theme={theme} align="right">
                Turn: {gameState.currentTurn}
              </StyledTableCell>
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
                <StyledTableCell theme={theme}>
                  {index === getCurrentPlayerIndex() && (
                    <ArrowRightIcon color="primary" style={{ fontSize: 24 }} />
                  )}
                </StyledTableCell>
                <StyledTableCell theme={theme} component="th" scope="row">
                  <SuperCapsText fontSize={theme.sizes.text}>{player.name}</SuperCapsText>
                </StyledTableCell>
                <StyledScoreCell theme={theme} align="right">
                  {calculateVictoryPoints(player)}
                </StyledScoreCell>
                <StyledTableCell theme={theme} align="right">
                  <StyledButton
                    theme={theme}
                    variant="contained"
                    size="small"
                    onClick={() => handlePlayerSelect(index)}
                  >
                    Select
                  </StyledButton>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Scoreboard;
