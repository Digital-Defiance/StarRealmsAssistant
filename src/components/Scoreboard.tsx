import React, { FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/system';
import SuperCapsText from '@/components/SuperCapsText';
import { useGameContext } from '@/components/GameContext';
import { PlayerChip } from './PlayerChip';
import { getPlayerLabel } from '@/game/starrealms-lib';

const TableText = styled(Typography)(() => ({
  fontFamily: 'Handel Gothic ITC Pro',
}));

const TableScore = styled(Typography)(() => ({
  fontFamily: 'Handel Gothic ITC Pro',
  fontWeight: 'bold',
}));

const Scoreboard: FC = () => {
  const { gameState } = useGameContext();

  if (!gameState) {
    return null; // or some fallback UI
  }

  return (
    <Paper elevation={3} sx={{ padding: 0, maxWidth: 600 }}>
      <TableContainer className="scoreboard">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableText className={`typography-text`} align="center">
                  Badge
                </TableText>
              </TableCell>
              <TableCell>
                <TableText className={`typography-text`} align="left">
                  Player
                </TableText>
              </TableCell>
              <TableCell>
                <TableText className={`typography-text`} align="center">
                  Authority
                </TableText>
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
                <TableCell align="center">
                  <Tooltip
                    title={
                      index === gameState.currentPlayerIndex
                        ? `${player.name} is the current player`
                        : ''
                    }
                  >
                    <PlayerChip
                      label={getPlayerLabel(gameState.players, index)}
                      size="small"
                      style={{
                        backgroundColor: player.color,
                        color: 'white',
                        fontWeight: index === gameState.currentPlayerIndex ? 'bold' : 'normal',
                        border: index === gameState.currentPlayerIndex ? '2px solid #000' : 'none',
                        minWidth: '30px',
                      }}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell component="th" scope="row" align="left">
                  <SuperCapsText className={`typography-text`}>{player.name}</SuperCapsText>
                </TableCell>
                <TableCell align="center">
                  <TableScore className={`typography-title`}>
                    {player.authority.authority}
                  </TableScore>
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
