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
  calculateCurrentTurnDuration,
  calculateGameDuration,
  calculateTurnDurations,
  calculateVictoryPointsAndSupplyByTurn,
  formatTimeSpan,
} from '@/game/dominion-lib-log';
import TabTitle from '@/components/TabTitle';
import { VictoryField } from '@/game/types';
import { CurrentStep } from '@/game/enumerations/current-step';
import ScrollableContainer from '@/components/ScrollableContainer';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function StatisticsScreen() {
  const { gameState } = useGameContext();
  const turnStats = calculateVictoryPointsAndSupplyByTurn(gameState);
  const gameTimeResult = calculateGameDuration(
    gameState.log,
    calculateTurnDurations,
    calculateCurrentTurnDuration
  );
  const averageTurnTime = calculateAverageTurnDuration(gameTimeResult.turnDurations);
  const playerColors = gameState.players.map((player) => player.color);

  const scoreData = {
    labels: turnStats.map((stat, index) => `${index + 1}`),
    datasets: gameState.players.map((player, index) => ({
      label: player.name,
      data: turnStats.map((stat) => stat.scoreByPlayer[index]),
      borderColor: playerColors[index],
      backgroundColor: playerColors[index],
      fill: false,
    })),
  };

  const victoryFields: VictoryField[] = ['curses', 'estates', 'duchies', 'provinces', 'colonies'];
  const victoryColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

  const supplyData = {
    labels: turnStats.map((stat, index) => `${index + 1}`),
    datasets: victoryFields.map((field, index) => ({
      label: field,
      data: turnStats.map((stat) => stat.supply[field as keyof typeof stat.supply]),
      borderColor: victoryColors[index],
      backgroundColor: victoryColors[index],
      fill: false,
    })),
  };

  const turnTimeData = {
    labels: gameTimeResult.turnDurations.map((_, index) => `${index + 1}`),
    datasets: [
      {
        label: 'Turn Time (seconds)',
        data: gameTimeResult.turnDurations.map((duration) => duration.duration / 1000),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      },
    ],
  };

  const gameStarted =
    gameState.currentStep === CurrentStep.GameScreen ||
    gameState.currentStep === CurrentStep.EndGame;
  const hasTurns = turnStats.length > 0;

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
            <Typography variant="h6">Player Scores</Typography>
            <Box className="graph-container">
              <Line data={scoreData} options={chartOptions} />
            </Box>
            <Typography variant="h6">Victory Supply Counts</Typography>
            <Box className="graph-container">
              <Line data={supplyData} options={chartOptions} />
            </Box>
            <Typography variant="h6">Turn Times</Typography>
            <Box className="graph-container">
              <Line data={turnTimeData} options={chartOptions} />
            </Box>
            <Typography variant="h6">Statistics Table</Typography>
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
                    <TableCell>Average Turn Time</TableCell>
                    <TableCell>{formatTimeSpan(averageTurnTime / 1000)}</TableCell>
                  </TableRow>
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
