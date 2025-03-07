import React, { FC } from 'react';
import AddPlayerNames from '@/components/AddPlayerNames';
import SelectFirstPlayer from '@/components/SelectFirstPlayer';
import SetGameOptions from '@/components/SetGameOptions';
import GameInterface from '@/components/GameInterface';
import EndGame from '@/components/EndGame';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { useGameContext } from '@/components/GameContext';
import { CurrentStep } from '@/game/enumerations/current-step';
import { DEFAULT_FIRST_TURN_CARDS, NO_PLAYER, StepTransitions } from '@/game/constants';
import {
  getNextPlayerIndex,
  incrementTurnCountersAndPlayerIndices,
  resetPlayerTurnCounters,
} from '@/game/starrealms-lib';
import { undoAction } from '@/game/starrealms-lib-undo';
import { addLogEntry } from '@/game/starrealms-lib-log';
import { useAlert } from '@/components/AlertContext';
import { IGame } from '@/game/interfaces/game';
import { deepClone } from '@/game/utils';
import { EmptyGameState } from '@/game/constants';

const StarRealmsAssistant: FC = () => {
  const { gameState, setGameState } = useGameContext();
  const { showAlert } = useAlert();

  const undoLastAction = () => {
    setGameState((prevGame) => {
      const { game, success } = undoAction(prevGame, prevGame.log.length - 1);
      if (!success) {
        showAlert('Undo Failed', 'Unable to undo the last action.');
        return prevGame;
      }
      return game;
    });
  };

  const nextStep = () => {
    setGameState((prevState: IGame) => {
      const newGame = deepClone<IGame>(prevState);
      newGame.currentStep = StepTransitions[prevState.currentStep] || prevState.currentStep;
      return newGame;
    });
  };

  /**
   * Start the game with the selected players and options.
   */
  const startGame = () => {
    // The game initialization is now handled in SetGameOptions
    setGameState((prevState: IGame) => {
      const newGame = deepClone<IGame>(prevState);
      newGame.currentStep = CurrentStep.Game;
      // the first turn has 3 cards
      newGame.players[newGame.currentPlayerIndex].turn.cards = DEFAULT_FIRST_TURN_CARDS;
      return newGame;
    });
  };

  const nextTurn = () => {
    setGameState((prevGame: IGame) => {
      let newGame = deepClone(prevGame);
      const nextPlayerIndex = getNextPlayerIndex(newGame);
      addLogEntry(newGame, nextPlayerIndex, GameLogAction.NEXT_TURN, {
        currentPlayerIndex: nextPlayerIndex,
        playerTurnDetails: gameState.players.map((player) => player.turn),
        prevPlayerIndex: gameState.currentPlayerIndex,
        turn: prevGame.currentTurn + 1,
      });
      newGame = resetPlayerTurnCounters(incrementTurnCountersAndPlayerIndices(newGame));
      return newGame;
    });
  };

  const endGame = () => {
    setGameState((prevGame: IGame) => {
      const newGame = deepClone<IGame>(prevGame);
      addLogEntry(newGame, NO_PLAYER, GameLogAction.END_GAME, {
        prevPlayerIndex: gameState.currentPlayerIndex,
      });
      newGame.currentStep = CurrentStep.EndGame;
      newGame.currentPlayerIndex = NO_PLAYER;
      newGame.selectedPlayerIndex = NO_PLAYER;
      return newGame;
    });
  };

  const resetGame = () => {
    setGameState({
      ...EmptyGameState(),
      currentStep: CurrentStep.AddPlayerNames,
    });
  };

  switch (gameState.currentStep) {
    case CurrentStep.AddPlayerNames:
      return <AddPlayerNames nextStep={nextStep} />;
    case CurrentStep.SelectFirstPlayer:
      return <SelectFirstPlayer nextStep={nextStep} />;
    case CurrentStep.SetGameOptions:
      return <SetGameOptions startGame={startGame} />;
    case CurrentStep.Game:
      return (
        <GameInterface nextTurn={nextTurn} endGame={endGame} undoLastAction={undoLastAction} />
      );
    case CurrentStep.EndGame:
      return <EndGame game={gameState} onNewGame={resetGame} />;
    default:
      return null;
  }
};

export default StarRealmsAssistant;
