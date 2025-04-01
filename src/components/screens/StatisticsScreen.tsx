import React, { useState, useMemo } from 'react'; // Added useMemo
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
  TooltipItem, // Added TooltipItem
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
  FormControlLabel,
  Checkbox,
  FormGroup, // Added FormGroup
} from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import { IGameOptions } from '@/game/interfaces/game-options'; // Added import
import { ChartData } from 'chart.js'; // Added import
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
import { ITurnStatistics } from '@/game/interfaces/turn-statistics'; // Import ITurnStatistics

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Define types for the stats we want to graph
type PlayerStatKey =
  | 'playerTrade'
  | 'playerCombat'
  | 'playerGains'
  | 'playerDiscards'
  | 'playerCardsDrawn'
  | 'bossAssimilation';

// Define a more specific type for the option flags
type OptionFlag = keyof IGameOptions;

interface StatConfig {
  key: PlayerStatKey;
  label: string;
  optionFlag?: OptionFlag;
}

const playerStatConfigs: StatConfig[] = [
  { key: 'playerTrade', label: 'Trade' },
  { key: 'playerCombat', label: 'Combat' },
  { key: 'playerGains', label: 'Gains', optionFlag: 'trackCardGains' },
  { key: 'playerDiscards', label: 'Discards', optionFlag: 'trackDiscard' },
  {
    key: 'playerCardsDrawn',
    label: 'Cards Drawn',
    optionFlag: 'trackCardCounts',
  },
  {
    key: 'bossAssimilation',
    label: 'Boss Assimilation',
    optionFlag: 'trackAssimilation',
  },
];

// Define a type for the data points in the transformed structure
interface PlayerTurnStatPoint {
  playerTurn: number; // The turn number for this specific player (1st, 2nd, etc.)
  gameTurn: number; // The overall game turn number
  value: number | null; // The statistic value for that turn
}

// Define the structure for the transformed player stats
type TransformedPlayerStats = Record<PlayerStatKey, PlayerTurnStatPoint[][]>;

export default function StatisticsScreen() {
  const { gameState } = useGameContext();
  const { options, players, turnStatisticsCache, log, currentStep, currentTurn } = gameState;

  // Helper to check if an option flag is enabled
  const isOptionEnabled = (flag: OptionFlag | undefined): boolean => {
    if (!flag) return true; // No flag means always enabled for the graph toggle

    return !!options[flag as keyof IGameOptions];
  };

  // State for graph visibility
  const [showGraphs, setShowGraphs] = useState<Record<PlayerStatKey, boolean>>(
    playerStatConfigs.reduce(
      (acc, config) => {
        acc[config.key] = isOptionEnabled(config.optionFlag); // Default visibility based on option enabled status
        return acc;
      },
      {} as Record<PlayerStatKey, boolean>
    )
  );

  // State for player visibility
  const [visiblePlayers, setVisiblePlayers] = useState<boolean[]>(() => players.map(() => true));

  const handleGraphCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowGraphs({
      ...showGraphs,
      [event.target.name as PlayerStatKey]: event.target.checked,
    });
  };

  const handlePlayerVisibilityChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newVisiblePlayers = [...visiblePlayers];
    newVisiblePlayers[index] = event.target.checked;
    setVisiblePlayers(newVisiblePlayers);
  };

  const turnDurations = calculateTurnDurations(log);

  let averageTurnTime = 0;
  let totalGameTime = 0;
  try {
    if (turnStatisticsCache.length > 0 && log.length > 0) {
      averageTurnTime = calculateAverageTurnDuration(turnDurations);
      totalGameTime = calculateDurationUpToEvent(log, log[log.length - 1].timestamp);
    }
  } catch (error) {
    console.error('Error calculating statistics:', error);
  }
  const playerColors = players.map((player) => player.color);
  // Original turn labels (for non-player-specific graphs)
  const gameTurnLabels = turnStatisticsCache.map((stat) => `${stat.turn}`);

  // --- Data Transformation for Player-Specific Graphs ---
  const playerTurnStats = useMemo<TransformedPlayerStats>(() => {
    const stats: TransformedPlayerStats = playerStatConfigs.reduce((acc, config) => {
      acc[config.key] = players.map(() => []); // Initialize empty array for each player
      return acc;
    }, {} as TransformedPlayerStats);

    const playerTurnCounters = players.map(() => 0); // Track turn count for each player

    turnStatisticsCache.forEach((stat: ITurnStatistics) => {
      const playerIndex = stat.playerIndex;
      if (playerIndex !== undefined && playerIndex >= 0 && playerIndex < players.length) {
        playerTurnCounters[playerIndex]++;
        const currentPlayerTurn = playerTurnCounters[playerIndex];

        playerStatConfigs.forEach((config) => {
          if (config.key === 'bossAssimilation') {
            // Special handling for bossAssimilation
            if (
              playerIndex === 0 && // Only for the boss (player 0)
              players[0].boss && // Ensure the player is a boss
              options.trackAssimilation && // Check if tracking is enabled
              stat.bossAssimilation !== undefined && // Ensure the value exists
              stat.bossAssimilation !== null &&
              stats.bossAssimilation?.[0] // Ensure the target array exists
            ) {
              stats.bossAssimilation[0].push({
                playerTurn: currentPlayerTurn,
                gameTurn: stat.turn,
                value: stat.bossAssimilation,
              });
            }
          } else {
            // Existing logic for other player-specific stats
            // Check if the stat key exists and the corresponding array exists for the player
            if (stat[config.key] && stats[config.key]?.[playerIndex]) {
              const playerStatValue =
                stat[config.key as keyof Omit<ITurnStatistics, 'bossAssimilation'>];
              // Check if it's a non-null object (which covers the indexable types)
              if (playerStatValue && typeof playerStatValue === 'object') {
                // Cast to the expected indexable type
                const indexableStat = playerStatValue as { [key: number]: number };
                // Check if the specific playerIndex exists as a key
                if (playerIndex in indexableStat) {
                  const value = indexableStat[playerIndex] ?? null;
                  stats[config.key][playerIndex].push({
                    playerTurn: currentPlayerTurn,
                    gameTurn: stat.turn,
                    value: value,
                  });
                }
              }
            }
          }
        });
      }
    });

    return stats;
  }, [turnStatisticsCache, players, options.trackAssimilation]); // Dependencies: recalculate if cache or players change

  // --- Prepare Chart Data ---
  const scoreData = {
    labels: gameTurnLabels, // Use game turn labels for score
    datasets: players.map((player, index) => ({
      label: player.name,
      data: turnStatisticsCache.map((stat) => stat.playerScores[index]),
      borderColor: playerColors[index],
      backgroundColor: playerColors[index],
      fill: false,
    })),
  };

  const turnTimeData = {
    labels: gameTurnLabels, // Use game turn labels for turn time
    datasets: [
      {
        label: 'Turn Time (seconds)',
        data: turnStatisticsCache.map((stat) => stat.turnDuration / 1000),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      },
    ],
  };

  // Define the type for chart data (using the transformed data)
  type PlayerChartJsData = ChartData<'line', (number | null)[], number>; // X-axis is player turn number

  // Generate data for new player stats using transformed data
  const playerStatChartData: Record<PlayerStatKey, PlayerChartJsData> = playerStatConfigs.reduce(
    (acc, config) => {
      // Determine the maximum player turn number across all visible players
      let maxPlayerTurn = 0;
      players.forEach((_, index) => {
        if (visiblePlayers[index] && playerTurnStats[config.key]?.[index]) {
          const lastTurn = playerTurnStats[config.key][index].slice(-1)[0]?.playerTurn ?? 0;
          maxPlayerTurn = Math.max(maxPlayerTurn, lastTurn);
        }
      });
      const playerTurnLabels = Array.from({ length: maxPlayerTurn }, (_, i) => i + 1); // Labels 1, 2, 3...

      acc[config.key] = {
        labels: playerTurnLabels, // Use player turn numbers as labels
        datasets: (config.key === 'bossAssimilation' ? players.slice(0, 1) : players) // Only use player 0 for assimilation graph
          .map((player, index) => {
            // For assimilation, index will always be 0, but check visibility anyway
            if (!visiblePlayers[index] || !playerTurnStats[config.key]?.[index]) {
              return null; // Skip dataset if player is hidden or no data
            }
            // Map transformed data to chart.js format {x: playerTurn, y: value}
            // Need to ensure data aligns with playerTurnLabels
            const dataPoints = Array(maxPlayerTurn).fill(null); // Initialize with nulls
            playerTurnStats[config.key][index].forEach((point) => {
              if (point.playerTurn > 0 && point.playerTurn <= maxPlayerTurn) {
                dataPoints[point.playerTurn - 1] = point.value; // playerTurn is 1-based index
              }
            });

            return {
              label: player.name,
              data: dataPoints, // Use the aligned data points
              borderColor: playerColors[index],
              backgroundColor: playerColors[index],
              fill: false,
              // parsing: false, // Removed this line
              // Store gameTurn info accessible via context in tooltip
            };
          })
          .filter((dataset): dataset is NonNullable<typeof dataset> => dataset !== null), // Filter out null datasets
      };
      return acc;
    },
    {} as Record<PlayerStatKey, PlayerChartJsData>
  );

  // --- End Prepare Chart Data ---

  const gameStarted = currentStep === CurrentStep.Game || currentStep === CurrentStep.EndGame;
  const hasTurns = turnStatisticsCache.length > 0;

  // Base chart options
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Function to generate specific options for player stat charts, including the tooltip callback
  const getPlayerChartOptions = (currentConfig: StatConfig) => {
    // Use curly braces
    return {
      // Explicit return
      ...baseChartOptions,
      scales: {
        ...baseChartOptions.scales,
        x: {
          title: {
            display: true,
            text:
              currentConfig.key === 'bossAssimilation'
                ? "Boss' Nth Turn (Hover for Game Turn)"
                : "Player's Nth Turn (Hover for Game Turn)", // Updated X-axis title
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'line'>) => {
              // Changed to arrow function
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
                // Access gameTurn directly from the source data using context
                // Find the dataset corresponding to the player
                const playerIndex = players.findIndex((p) => p.name === context.dataset.label);
                // Find the specific stat config key using the passed config
                const statKey = currentConfig.key; // Directly use the key from the passed config

                if (
                  playerIndex !== -1 &&
                  statKey &&
                  playerTurnStats[statKey]?.[playerIndex]?.[context.dataIndex]
                ) {
                  const gameTurn =
                    playerTurnStats[statKey][playerIndex][context.dataIndex].gameTurn;
                  if (gameTurn !== undefined) {
                    label += ` (Game Turn ${gameTurn})`;
                  }
                }
              }
              return label;
            },
          },
        },
      },
    }; // End of return
  }; // End of function

  return (
    <ScrollableContainer>
      <Box className="statistics-container">
        <TabTitle>Game Statistics</TabTitle>
        {gameStarted && hasTurns ? (
          <>
            <Typography variant="h6">Player Scores</Typography>
            <Box className="graph-container">
              <Line data={scoreData} options={baseChartOptions} />
            </Box>
            <Typography variant="h6">Turn Times</Typography>
            <Box className="graph-container">
              <Line data={turnTimeData} options={baseChartOptions} />
            </Box>

            {/* Checkboxes for Player Stat Graphs */}
            <Typography variant="h6">Player Statistics Graphs by player turn</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {playerStatConfigs.map((config) => {
                // Determine if the checkbox should be shown
                let showCheckbox = isOptionEnabled(config.optionFlag);
                // Special condition for Boss Assimilation: requires option AND boss player
                if (config.key === 'bossAssimilation') {
                  showCheckbox = showCheckbox && !!players[0]?.boss; // Check if player 0 is a boss
                }

                return (
                  showCheckbox && (
                    <FormControlLabel
                      key={config.key}
                      control={
                        <Checkbox
                          checked={showGraphs[config.key]}
                          onChange={handleGraphCheckboxChange} // Renamed handler
                          name={config.key}
                        />
                      }
                      label={config.label}
                    />
                  )
                );
              })}
            </Box>

            {/* Player Visibility Filters */}
            <Typography variant="h6">Filter Players</Typography>
            <FormGroup row sx={{ mb: 2 }}>
              {players.map((player, index) => (
                <FormControlLabel
                  key={player.name} // Use player.name as key
                  control={
                    <Checkbox
                      checked={visiblePlayers[index]}
                      onChange={(e) => handlePlayerVisibilityChange(e, index)}
                      name={player.name}
                      sx={{
                        color: playerColors[index],
                        '&.Mui-checked': { color: playerColors[index] },
                      }}
                    />
                  }
                  label={player.name}
                />
              ))}
            </FormGroup>

            {/* Conditionally Rendered Player Stat Graphs */}
            {playerStatConfigs.map(
              (config) =>
                showGraphs[config.key] && (
                  <Box key={config.key}>
                    {/* Updated graph title */}
                    <Typography variant="h6">
                      {config.label}{' '}
                      {config.key === 'bossAssimilation' ? 'per Turn' : 'per Player Turn'}
                    </Typography>
                    <Box className="graph-container">
                      {/* Use new data and generate options dynamically */}
                      <Line
                        data={playerStatChartData[config.key]}
                        options={getPlayerChartOptions(config)} // Pass current config
                      />
                    </Box>
                  </Box>
                )
            )}

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
                    <TableCell>{currentTurn}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Game Time</TableCell>
                    <TableCell>
                      {formatTimeSpan(totalGameTime)}
                      {currentStep !== CurrentStep.EndGame ? '*' : ''}
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
                  {players.map((player, index) => (
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
