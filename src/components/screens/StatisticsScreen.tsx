import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import {
  calculateAverageTurnDuration,
  calculateAverageTurnDurationForPlayer,
  calculateDurationUpToEvent,
  calculateTurnDurations,
  formatTimeSpan,
  getAverageActionsPerTurn,
} from '@/game/starrealms-lib-log';
import TabTitle from '@/components/TabTitle';
import { CurrentStep } from '@/game/enumerations/current-step';
import ScrollableContainer from '@/components/ScrollableContainer';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function StatisticsScreen() {
  const { gameState } = useGameContext();
  const turnDurations = calculateTurnDurations(gameState.log);

  let averageTurnTime = 0;
  let totalGameTime = 0;
  try {
    if (gameState.turnStatisticsCache.length > 0 && gameState.log.length > 0) {
      averageTurnTime = calculateAverageTurnDuration(turnDurations);
      totalGameTime = calculateDurationUpToEvent(
        gameState.log,
        gameState.log[gameState.log.length - 1].timestamp
      );
    }
  } catch (error) {
    console.error('Error calculating statistics:', error);
  }
  const playerColors = gameState.players.map((player) => player.color);

  const scoreData = {
    labels: gameState.turnStatisticsCache.map((stat) => `${stat.turn}`),
    datasets: gameState.players.map((player, index) => ({
      label: player.name,
      data: gameState.turnStatisticsCache.map((stat) => stat.playerScores[index]),
      borderColor: playerColors[index],
      backgroundColor: playerColors[index],
      fill: false,
    })),
  };

  const turnTimeData = {
    labels: gameState.turnStatisticsCache.map((stat) => `${stat.turn}`),
    datasets: [
      {
        label: 'Turn Time (seconds)',
        data: gameState.turnStatisticsCache.map((stat) => stat.turnDuration / 1000),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      },
    ],
  };

  const gameStarted =
    gameState.currentStep === CurrentStep.Game || gameState.currentStep === CurrentStep.EndGame;
  const hasTurns = gameState.turnStatisticsCache.length > 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
  };

  return (
    <ScrollableContainer>
      <Box className="statistics-container">
        <TabTitle>Game Statistics</TabTitle>
        {gameStarted && hasTurns ? (
          <>
            <Typography variant="h6">Authority</Typography>
            <Box className="graph-container">
              <Line data={scoreData} options={chartOptions} />
            </Box>
            <Typography variant="h6">Turn Times</Typography>
            <Box className="graph-container">
              <Line data={turnTimeData} options={chartOptions} />
            </Box>
            <Typography variant="h6">Game Statistics</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Statistic</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Total Turns</TableCell>
                    <TableCell>{gameState.currentTurn}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Game Time</TableCell>
                    <TableCell>
                      {formatTimeSpan(totalGameTime)}
                      {gameState.currentStep !== CurrentStep.EndGame ? '*' : ''}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Average Turn Time</TableCell>
                    <TableCell>{formatTimeSpan(averageTurnTime)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Average Actions Per Turn</TableCell>
                    <TableCell>{getAverageActionsPerTurn(gameState)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <br />
            <Typography variant="h6">Average Player Turn Time</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Player</TableCell>
                    <TableCell>Average Turn Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gameState.players.map((player, index) => (
                    <TableRow key={player.name}>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>
                        {formatTimeSpan(
                          calculateAverageTurnDurationForPlayer(turnDurations, index)
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Typography variant="h6">
            {gameStarted
              ? 'At least one turn must be completed to show statistics.'
              : 'The game has not started yet.'}
          </Typography>
        )}
      </Box>
    </ScrollableContainer>
  );
}
