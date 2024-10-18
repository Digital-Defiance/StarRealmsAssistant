import React, { useEffect, useState } from 'react';
import AddPlayerNames from '@/components/AddPlayerNames';
import SelectFirstPlayer from '@/components/SelectFirstPlayer';
import SetGameOptions from '@/components/SetGameOptions';
import GameScreen from '@/components/GameScreen';
import EndGame from '@/components/EndGame';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { useGameContext } from '@/components/GameContext';
import { CurrentStep } from '@/game/enumerations/current-step';
import { NO_PLAYER, StepTransitions } from '@/game/constants';
import {
  EmptyGameState,
  getNextPlayerIndex,
  incrementTurnCountersAndPlayerIndices,
  resetPlayerTurnCounters,
} from '@/game/dominion-lib';
import { canUndoAction, undoAction } from '@/game/dominion-lib-undo';
import { addLogEntry } from '@/game/dominion-lib-log';
import { useAlert } from '@/components/AlertContext';
import { Location, NavigateFunction } from 'react-router-dom';

interface DominionAssistantProps {
  route: Location;
  navigation: NavigateFunction;
}

const DominionAssistant: React.FC<DominionAssistantProps> = ({ route, navigation }) => {
  const { gameState, setGameState } = useGameContext();
  const [canUndo, setCanUndo] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    setCanUndo(canUndoAction(gameState, gameState.log.length - 1));
  }, [gameState, gameState.log]);

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
    setGameState((prevState) => ({
      ...prevState,
      currentStep: StepTransitions[prevState.currentStep] || prevState.currentStep,
    }));
  };

  /**
   * Start the game with the selected players and options.
   */
  const startGame = () => {
    // The game initialization is now handled in SetGameOptions
    setGameState((prevState) => ({
      ...prevState,
      currentStep: CurrentStep.GameScreen,
    }));
  };

  const nextTurn = () => {
    setGameState((prevGame) => {
      const nextPlayerIndex = getNextPlayerIndex(prevGame);
      addLogEntry(prevGame, NO_PLAYER, GameLogActionWithCount.NEXT_TURN, {
        playerTurnDetails: gameState.players.map((player) => player.turn),
        prevPlayerIndex: gameState.currentPlayerIndex,
        newPlayerIndex: nextPlayerIndex,
      });
      const updatedGame = incrementTurnCountersAndPlayerIndices(prevGame);
      return resetPlayerTurnCounters(updatedGame);
    });
  };

  const endGame = () => {
    setGameState((prevState) => {
      addLogEntry(prevState, NO_PLAYER, GameLogActionWithCount.END_GAME, {
        prevPlayerIndex: gameState.currentPlayerIndex,
        newPlayerIndex: NO_PLAYER,
      });

      return {
        ...prevState,
        currentStep: CurrentStep.EndGame,
        currentPlayerIndex: NO_PLAYER,
        selectedPlayerIndex: NO_PLAYER,
      };
    });
  };

  const resetGame = () => {
    setGameState({
      ...EmptyGameState,
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
    case CurrentStep.GameScreen:
      return <GameScreen nextTurn={nextTurn} endGame={endGame} undoLastAction={undoLastAction} />;
    case CurrentStep.EndGame:
      return <EndGame game={gameState} onNewGame={resetGame} />;
    default:
      return null;
  }
};

export default DominionAssistant;
