import React, { FC } from 'react';
import { useGameContext } from './GameContext';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import { getPlayerLabel } from '@/game/starrealms-lib';
import { addLogEntry } from '@/game/starrealms-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';
import { PlayerChip } from './PlayerChip';

const ScoreText = styled(Typography)(() => ({
  fontFamily: 'Minion Pro Bold Caption',
  fontWeight: 'bold',
  fontSize: '1rem',
  textAlign: 'center',
}));

export const PlayerBar: FC = () => {
  const { gameState, setGameState } = useGameContext();

  if (!gameState) {
    return null;
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

  const isGamePaused = (): boolean => {
    const lastLogEntry = gameState.log.length > 0 ? gameState.log[gameState.log.length - 1] : null;
    return lastLogEntry !== null && lastLogEntry.action === GameLogAction.PAUSE;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        padding: '8px',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 3,
        }}
      >
        {gameState.players.map((player, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: isGamePaused() ? 'not-allowed' : 'pointer',
              opacity: isGamePaused() ? 0.7 : 1,
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor:
                index === gameState.selectedPlayerIndex ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: isGamePaused() ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
              },
            }}
            onClick={() => !isGamePaused() && handlePlayerSelect(index)}
          >
            <Tooltip
              title={`${player.name}${index === gameState.currentPlayerIndex ? ' (Current Player)' : ''}`}
            >
              <PlayerChip
                label={getPlayerLabel(gameState.players, index)}
                size="medium"
                style={{
                  backgroundColor: player.color,
                  color: 'white',
                  fontWeight: index === gameState.currentPlayerIndex ? 'bold' : 'normal',
                  border: index === gameState.currentPlayerIndex ? '2px solid #000' : 'none',
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                }}
              />
            </Tooltip>
            <ScoreText mt={1}>{player.authority.authority}</ScoreText>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
