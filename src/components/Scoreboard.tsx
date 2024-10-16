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
import { styled } from '@mui/system';
import SuperCapsText from '@/components/SuperCapsText';
import { calculateVictoryPoints } from '@/game/dominion-lib';
import { SUBTITLE_SIZE, TEXT_SIZE } from '@/components/constants';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useGameContext } from '@/components/GameContext';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: 'TrajanProBold',
  fontSize: TEXT_SIZE,
}));

const StyledScoreCell = styled(TableCell)(({ theme }) => ({
  fontFamily: 'TrajanProBold',
  fontSize: SUBTITLE_SIZE,
  fontWeight: 'bold',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  fontFamily: 'TrajanProBold',
}));

const Scoreboard: React.FC = () => {
  const { gameState, setGameState } = useGameContext();

  if (!gameState) {
    return null; // or some fallback UI
  }

  const handlePlayerSelect = (index: number) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      return { ...prevState, selectedPlayerIndex: index };
    });
  };

  const getCurrentPlayerIndex = () => {
    return (gameState.firstPlayerIndex + gameState.currentTurn - 1) % gameState.players.length;
  };

  return (
    <Paper elevation={3} sx={{ padding: 0, maxWidth: 600, margin: 'auto' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Current</StyledTableCell>
              <StyledTableCell>Player</StyledTableCell>
              <StyledTableCell align="right">Score</StyledTableCell>
              <StyledTableCell align="right">Turn: {gameState.currentTurn}</StyledTableCell>
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
                <StyledTableCell>
                  {index === getCurrentPlayerIndex() && (
                    <ArrowRightIcon color="primary" style={{ fontSize: 24 }} />
                  )}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  <SuperCapsText fontSize={TEXT_SIZE}>{player.name}</SuperCapsText>
                </StyledTableCell>
                <StyledScoreCell align="right">{calculateVictoryPoints(player)}</StyledScoreCell>
                <StyledTableCell align="right">
                  <StyledButton
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
