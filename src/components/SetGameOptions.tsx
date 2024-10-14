import React from 'react';
import { Box, Typography, Checkbox, Tooltip, Button } from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import { OptionField, OptionSubField } from '@/game/types';
import { IGame } from '@/game/interfaces/game';
import { NewGameState } from '@/game/dominion-lib';

interface SetGameOptionsProps {
  startGame: () => void;
}

const SetGameOptions: React.FC<SetGameOptionsProps> = ({ startGame }) => {
  const { gameState, setGameState } = useGameContext();

  const updateOption = <T extends OptionField>(
    field: T,
    subfield: OptionSubField<T>,
    value: boolean
  ) => {
    setGameState((prevState: IGame) => {
      if (!prevState) return prevState;
      const newOptions = { ...prevState.options };

      if (field === 'curses') {
        newOptions.curses = value;
      } else if (field === 'expansions') {
        newOptions.expansions = {
          ...newOptions.expansions,
          [subfield as keyof typeof newOptions.expansions]: value,
        };
      } else if (field === 'mats') {
        newOptions.mats = {
          ...newOptions.mats,
          [subfield as keyof typeof newOptions.mats]: value,
        };
      }

      return { ...prevState, options: newOptions };
    });
  };

  const handleStartGame = () => {
    setGameState((prevState) => {
      return NewGameState(prevState);
    });

    startGame();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          checked={gameState.options.curses}
          onChange={(e) => updateOption('curses', true, e.target.checked)}
        />
        <Tooltip title="Include curses in the game" arrow>
          <Typography variant="h6">Curses</Typography>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          checked={gameState.options.mats.favors}
          onChange={(e) => updateOption('mats', 'favors', e.target.checked)}
        />
        <Tooltip title="Include favors in the game" arrow>
          <Typography variant="h6">Favors</Typography>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          checked={gameState.options.mats.debt}
          onChange={(e) => updateOption('mats', 'debt', e.target.checked)}
        />
        <Tooltip title="Include debts in the game" arrow>
          <Typography variant="h6">Debts</Typography>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          checked={gameState.options.mats.coffersVillagers}
          onChange={(e) => updateOption('mats', 'coffersVillagers', e.target.checked)}
        />
        <Tooltip title="Include coffers and villagers in the game" arrow>
          <Typography variant="h6">Coffers/Villagers</Typography>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          checked={gameState.options.expansions.prosperity}
          onChange={(e) => updateOption('expansions', 'prosperity', e.target.checked)}
        />
        <Tooltip title="Include platinum and colonies in the game" arrow>
          <Typography variant="h6">Prosperity</Typography>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          checked={gameState.options.expansions.risingSun}
          onChange={(e) => updateOption('expansions', 'risingSun', e.target.checked)}
        />
        <Tooltip title="Enable Rising Sun" arrow>
          <Typography variant="h6">Rising Sun</Typography>
        </Tooltip>
      </Box>

      {gameState.options.expansions.risingSun && (
        <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: 3 }}>
          <Checkbox
            checked={gameState.risingSun?.greatLeaderProphecy || false}
            onChange={(e) =>
              setGameState((prevState: IGame) => ({
                ...prevState,
                risingSun: {
                  prophecy: {
                    suns: prevState.risingSun?.prophecy.suns || 0,
                  },
                  greatLeaderProphecy: e.target.checked,
                },
              }))
            }
          />
          <Tooltip title="Enable Great Leader- +1 action after each action" arrow>
            <Typography variant="h6">Great Leader</Typography>
          </Tooltip>
        </Box>
      )}

      <Button variant="contained" onClick={handleStartGame} sx={{ marginTop: 2 }}>
        Start Game
      </Button>
    </Box>
  );
};

export default SetGameOptions;
