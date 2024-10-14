import React from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { IGame } from '@/game/interfaces/game';
import { calculateVictoryPoints } from '@/game/dominion-lib';
import SuperCapsText from '@/components/SuperCapsText';

interface EndGameProps {
  game: IGame;
  onNewGame: () => void;
}

const EndGame: React.FC<EndGameProps> = ({ game, onNewGame }) => {
  const sortedPlayers = [...game.players].sort(
    (a, b) => calculateVictoryPoints(b) - calculateVictoryPoints(a)
  );

  return (
    <Paper elevation={3} sx={{ padding: 2, maxWidth: 600, margin: 'auto' }}>
      <SuperCapsText fontSize={32}>Game Over</SuperCapsText>
      <Typography variant="h6" component="div" gutterBottom align="center">
        Total Turns: {game.currentTurn}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Player</TableCell>
              <TableCell align="right">Victory Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPlayers.map((player, index) => (
              <TableRow key={player.name}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {player.name}
                  {index === 0 && (
                    <EmojiEventsIcon
                      color="primary"
                      sx={{ marginLeft: 1, verticalAlign: 'middle' }}
                    />
                  )}
                </TableCell>
                <TableCell align="right">{calculateVictoryPoints(player)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" color="primary" onClick={onNewGame} sx={{ mt: 2 }}>
        New Game
      </Button>
    </Paper>
  );
};

export default EndGame;
