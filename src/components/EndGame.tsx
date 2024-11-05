import React, { FC } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { IGame } from '@/game/interfaces/game';
import { calculateVictoryPoints, rankPlayers } from '@/game/dominion-lib';
import TabTitle from '@/components/TabTitle';
import CenteredContainer from '@/components/CenteredContainer';
import { RankedPlayer } from '@/game/interfaces/ranked-player';
import { IPlayer } from '@/game/interfaces/player';

interface EndGameProps {
  game: IGame;
  onNewGame: () => void;
}

const EndGame: FC<EndGameProps> = ({ game, onNewGame }) => {
  const playerScores: RankedPlayer[] = rankPlayers(game.players, calculateVictoryPoints);

  return (
    <CenteredContainer>
      <TabTitle>Game Over</TabTitle>
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
            {playerScores.map((rankedPlayer: RankedPlayer) => {
              const player: IPlayer = game.players[rankedPlayer.index];
              return (
                <TableRow key={player.name}>
                  <TableCell>{rankedPlayer.rank}</TableCell>
                  <TableCell>
                    <Chip
                      label={player.name.charAt(0).toUpperCase()}
                      size="small"
                      style={{
                        backgroundColor: player.color || 'gray',
                        color: 'white',
                        marginRight: '8px',
                      }}
                    />
                    {player.name}
                    {rankedPlayer.rank === 1 && (
                      <EmojiEventsIcon
                        color="primary"
                        sx={{ marginLeft: 1, verticalAlign: 'middle' }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">{rankedPlayer.score}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" color="primary" onClick={onNewGame} sx={{ mt: 2 }}>
        New Game
      </Button>
    </CenteredContainer>
  );
};

export default EndGame;
