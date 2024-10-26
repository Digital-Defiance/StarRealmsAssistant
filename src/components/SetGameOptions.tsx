import React from 'react';
import { Box, Button } from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import { OptionField, OptionSubField } from '@/game/types';
import { IGame } from '@/game/interfaces/game';
import { NewGameState } from '@/game/dominion-lib';
import CenteredContainer from '@/components/CenteredContainer';
import OptionItem from '@/components/OptionItem';
import TabTitle from '@/components/TabTitle';
import { deepClone } from '@/game/utils';
import { IGameOptions } from '@/game/interfaces/game-options';

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
      const newGame = deepClone<IGame>(prevState);

      if (field === 'curses') {
        newGame.options.curses = value;
      } else if (field === 'expansions') {
        newGame.options.expansions[subfield as keyof typeof newGame.options.expansions] = value;
      } else if (field === 'mats') {
        newGame.options.mats[subfield as keyof typeof newGame.options.mats] = value;
      }

      return newGame;
    });
  };

  const handleStartGame = () => {
    setGameState((prevState: IGame) => {
      return NewGameState(prevState);
    });

    startGame();
  };

  return (
    <CenteredContainer>
      <TabTitle>Game Options</TabTitle>

      <OptionItem
        checked={gameState.options.curses}
        onChange={(e) => {
          updateOption('curses', true, e.target.checked);
        }}
        title="Curses"
        tooltip="Include curses in the game"
      />

      <OptionItem
        checked={gameState.options.mats.favors}
        onChange={(e) => {
          updateOption('mats', 'favors', e.target.checked);
        }}
        title="Favors"
        tooltip="Include favors in the game"
      />

      <OptionItem
        checked={gameState.options.mats.debt}
        onChange={(e) => {
          updateOption('mats', 'debt', e.target.checked);
        }}
        title="Debts"
        tooltip="Include debts in the game"
      />

      <OptionItem
        checked={gameState.options.mats.coffersVillagers}
        onChange={(e) => {
          updateOption('mats', 'coffersVillagers', e.target.checked);
        }}
        title="Coffers/Villagers"
        tooltip="Include coffers and villagers in the game"
      />

      <OptionItem
        checked={gameState.options.expansions.prosperity}
        onChange={(e) => {
          updateOption('expansions', 'prosperity', e.target.checked);
        }}
        title="Prosperity"
        tooltip="Include platinum and colonies in the game"
      />

      <OptionItem
        checked={gameState.options.expansions.risingSun}
        onChange={(e) => {
          updateOption('expansions', 'risingSun', e.target.checked);
        }}
        title="Rising Sun"
        tooltip="Enable Rising Sun"
      />

      {gameState.options.expansions.risingSun && (
        <Box>
          <OptionItem
            checked={gameState.risingSun?.greatLeaderProphecy || false}
            onChange={(e) => {
              setGameState((prevState: IGame) => {
                const newGame = deepClone<IGame>(prevState);
                newGame.risingSun = {
                  prophecy: {
                    suns: prevState.risingSun?.prophecy.suns || 0,
                  },
                  greatLeaderProphecy: e.target.checked,
                };
                return newGame;
              });
            }}
            title="Great Leader"
            tooltip="Enable Great Leader- +1 action after each action"
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Button variant="contained" onClick={handleStartGame}>
          Start Game
        </Button>
      </Box>
    </CenteredContainer>
  );
};

export default SetGameOptions;
