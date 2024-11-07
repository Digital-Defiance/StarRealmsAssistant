import { GameLogAction } from '@/game/enumerations/game-log-action';

export enum FutureAction {
  START_GAME = 'Start Game',
  END_GAME = 'End Game',
  SAVE_GAME = 'Save Game',
  LOAD_GAME = 'Loade Game',
  NEXT_TURN = 'Next Turn',
  PAUSE = 'Pause Game',
  UNPAUSE = 'Unpause Game',
  SELECT_PLAYER = 'Select Player',
  GROUPED_ACTION = 'Grouped Action',
  ADD_ACTIONS = 'Add {COUNT} Actions',
  REMOVE_ACTIONS = 'Remove {COUNT} Actions',
  ADD_BUYS = 'Add {COUNT} Buys',
  REMOVE_BUYS = 'Remove {COUNT} Buys',
  ADD_COINS = 'Add {COUNT} Coins',
  REMOVE_COINS = 'Remove {COUNT} Coins',
  ADD_CARDS = 'Add {COUNT} Cards',
  REMOVE_CARDS = 'Remove {COUNT} Cards',
  ADD_GAINS = 'Add {COUNT} Gains',
  REMOVE_GAINS = 'Remove {COUNT} Gains',
  ADD_COFFERS = 'Add {COUNT} Coffers',
  REMOVE_COFFERS = 'Remove {COUNT} Coffers',
  ADD_VILLAGERS = 'Add {COUNT} Villagers',
  REMOVE_VILLAGERS = 'Remove {COUNT} Villagers',
  ADD_DEBT = 'Add {COUNT} Debt',
  REMOVE_DEBT = 'Remove {COUNT} Debt',
  ADD_FAVORS = 'Add {COUNT} Favors',
  REMOVE_FAVORS = 'Remove {COUNT} Favors',
  ADD_CURSES = 'Add {COUNT} Curses',
  REMOVE_CURSES = 'Remove {COUNT} Curses',
  ADD_ESTATES = 'Add {COUNT} Estates',
  REMOVE_ESTATES = 'Remove {COUNT} Estates',
  ADD_DUCHIES = 'Add {COUNT} Duchies',
  REMOVE_DUCHIES = 'Remove {COUNT} Duchies',
  ADD_PROVINCES = 'Add {COUNT} Provinces',
  REMOVE_PROVINCES = 'Remove {COUNT} Provinces',
  ADD_COLONIES = 'Add {COUNT} Colonies',
  REMOVE_COLONIES = 'Remove {COUNT} Colonies',
  ADD_VP_TOKENS = 'Add {COUNT} VP Tokens',
  REMOVE_VP_TOKENS = 'Remove {COUNT} VP Tokens',
  ADD_OTHER_VP = 'Add {COUNT} Other VP',
  REMOVE_OTHER_VP = 'Remove {COUNT} Other VP',
  ADD_PROPHECY = 'Add {COUNT} Prophecy Suns',
  REMOVE_PROPHECY = 'Remove {COUNT} Prophecy Suns',
  ADD_NEXT_TURN_ACTIONS = 'Add {COUNT} Next Turn Actions',
  REMOVE_NEXT_TURN_ACTIONS = 'Remove {COUNT} Next Turn Actions',
  ADD_NEXT_TURN_BUYS = 'Add {COUNT} Next Turn Buys',
  REMOVE_NEXT_TURN_BUYS = 'Remove {COUNT} Next Turn Buys',
  ADD_NEXT_TURN_COINS = 'Add {COUNT} Next Turn Coins',
  REMOVE_NEXT_TURN_COINS = 'Remove {COUNT} Next Turn Coins',
  ADD_NEXT_TURN_CARDS = 'Add {COUNT} Next Turn Cards',
  REMOVE_NEXT_TURN_CARDS = 'Remove {COUNT} Next Turn Cards',
}

export const futureActionMap: Record<GameLogAction, FutureAction> = {
  [GameLogAction.START_GAME]: FutureAction.START_GAME,
  [GameLogAction.END_GAME]: FutureAction.END_GAME,
  [GameLogAction.SAVE_GAME]: FutureAction.SAVE_GAME,
  [GameLogAction.LOAD_GAME]: FutureAction.LOAD_GAME,
  [GameLogAction.NEXT_TURN]: FutureAction.NEXT_TURN,
  [GameLogAction.PAUSE]: FutureAction.PAUSE,
  [GameLogAction.UNPAUSE]: FutureAction.UNPAUSE,
  [GameLogAction.SELECT_PLAYER]: FutureAction.SELECT_PLAYER,
  [GameLogAction.GROUPED_ACTION]: FutureAction.GROUPED_ACTION,
  [GameLogAction.ADD_ACTIONS]: FutureAction.ADD_ACTIONS,
  [GameLogAction.REMOVE_ACTIONS]: FutureAction.REMOVE_ACTIONS,
  [GameLogAction.ADD_BUYS]: FutureAction.ADD_BUYS,
  [GameLogAction.REMOVE_BUYS]: FutureAction.REMOVE_BUYS,
  [GameLogAction.ADD_COINS]: FutureAction.ADD_COINS,
  [GameLogAction.REMOVE_COINS]: FutureAction.REMOVE_COINS,
  [GameLogAction.ADD_CARDS]: FutureAction.ADD_CARDS,
  [GameLogAction.REMOVE_CARDS]: FutureAction.REMOVE_CARDS,
  [GameLogAction.ADD_GAINS]: FutureAction.ADD_GAINS,
  [GameLogAction.REMOVE_GAINS]: FutureAction.REMOVE_GAINS,
  [GameLogAction.ADD_COFFERS]: FutureAction.ADD_COFFERS,
  [GameLogAction.REMOVE_COFFERS]: FutureAction.REMOVE_COFFERS,
  [GameLogAction.ADD_VILLAGERS]: FutureAction.ADD_VILLAGERS,
  [GameLogAction.REMOVE_VILLAGERS]: FutureAction.REMOVE_VILLAGERS,
  [GameLogAction.ADD_DEBT]: FutureAction.ADD_DEBT,
  [GameLogAction.REMOVE_DEBT]: FutureAction.REMOVE_DEBT,
  [GameLogAction.ADD_FAVORS]: FutureAction.ADD_FAVORS,
  [GameLogAction.REMOVE_FAVORS]: FutureAction.REMOVE_FAVORS,
  [GameLogAction.ADD_CURSES]: FutureAction.ADD_CURSES,
  [GameLogAction.REMOVE_CURSES]: FutureAction.REMOVE_CURSES,
  [GameLogAction.ADD_ESTATES]: FutureAction.ADD_ESTATES,
  [GameLogAction.REMOVE_ESTATES]: FutureAction.REMOVE_ESTATES,
  [GameLogAction.ADD_DUCHIES]: FutureAction.ADD_DUCHIES,
  [GameLogAction.REMOVE_DUCHIES]: FutureAction.REMOVE_DUCHIES,
  [GameLogAction.ADD_PROVINCES]: FutureAction.ADD_PROVINCES,
  [GameLogAction.REMOVE_PROVINCES]: FutureAction.REMOVE_PROVINCES,
  [GameLogAction.ADD_COLONIES]: FutureAction.ADD_COLONIES,
  [GameLogAction.REMOVE_COLONIES]: FutureAction.REMOVE_COLONIES,
  [GameLogAction.ADD_VP_TOKENS]: FutureAction.ADD_VP_TOKENS,
  [GameLogAction.REMOVE_VP_TOKENS]: FutureAction.REMOVE_VP_TOKENS,
  [GameLogAction.ADD_OTHER_VP]: FutureAction.ADD_OTHER_VP,
  [GameLogAction.REMOVE_OTHER_VP]: FutureAction.REMOVE_OTHER_VP,
  [GameLogAction.ADD_PROPHECY]: FutureAction.ADD_PROPHECY,
  [GameLogAction.REMOVE_PROPHECY]: FutureAction.REMOVE_PROPHECY,
  [GameLogAction.ADD_NEXT_TURN_ACTIONS]: FutureAction.ADD_NEXT_TURN_ACTIONS,
  [GameLogAction.REMOVE_NEXT_TURN_ACTIONS]: FutureAction.REMOVE_NEXT_TURN_ACTIONS,
  [GameLogAction.ADD_NEXT_TURN_BUYS]: FutureAction.ADD_NEXT_TURN_BUYS,
  [GameLogAction.REMOVE_NEXT_TURN_BUYS]: FutureAction.REMOVE_NEXT_TURN_BUYS,
  [GameLogAction.ADD_NEXT_TURN_COINS]: FutureAction.ADD_NEXT_TURN_COINS,
  [GameLogAction.REMOVE_NEXT_TURN_COINS]: FutureAction.REMOVE_NEXT_TURN_COINS,
  [GameLogAction.ADD_NEXT_TURN_CARDS]: FutureAction.ADD_NEXT_TURN_CARDS,
  [GameLogAction.REMOVE_NEXT_TURN_CARDS]: FutureAction.REMOVE_NEXT_TURN_CARDS,
};
