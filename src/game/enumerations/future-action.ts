import { GameLogAction } from '@/game/enumerations/game-log-action';

export enum FutureAction {
  START_GAME = 'Start Game',
  END_GAME = 'End Game',
  SAVE_GAME = 'Sav Game',
  LOAD_GAME = 'Load Game',
  NEXT_TURN = 'Next Turn',
  BOSS_SKIPPED = 'Skip Boss Turn',
  PAUSE = 'Pause Game',
  UNPAUSE = 'Unpause Game',
  SELECT_PLAYER = 'Select Player',
  ADD_TRADE = 'Add {COUNT} Trade',
  REMOVE_TRADE = 'Remove {COUNT} Trade',
  ADD_COMBAT = 'Add {COUNT} Combat',
  REMOVE_COMBAT = 'Remove {COUNT} Combat',
  ADD_AUTHORITY = 'Add {COUNT} Authority',
  REMOVE_AUTHORITY = 'Remove {COUNT} Authority',
  ADD_ASSIMILATION = 'Add {COUNT} Assimilation',
  REMOVE_ASSIMILATION = 'Remove {COUNT} Assimilation',
  ADD_CARDS = 'Add {COUNT} Cards',
  REMOVE_CARDS = 'Remove {COUNT} Cards',
  ADD_GAINS = 'Add {COUNT} Gains',
  REMOVE_GAINS = 'Remove {COUNT} Gains',
  ADD_DISCARD = 'Add {COUNT} Discards',
  REMOVE_DISCARD = 'Remove {COUNT} Discards',
  SCRAP = 'Scrap {COUNT} Cards',
  UNSCRAP = 'Unscrap {COUNT} Cards',
  ADD_NEXT_TURN_TRADE = 'Add Next Turn {COUNT} Trade',
  REMOVE_NEXT_TURN_TRADE = 'Remove Next Turn {COUNT} Trade',
  ADD_NEXT_TURN_COMBAT = 'Add Next Turn {COUNT} Combat',
  REMOVE_NEXT_TURN_COMBAT = 'Remove Next Turn {COUNT} Combat',
  ADD_NEXT_TURN_CARDS = 'Add Next Turn {COUNT} Cards',
  REMOVE_NEXT_TURN_CARDS = 'Remove Next Turn {COUNT} Cards',
  ADD_NEXT_TURN_GAINS = 'Add Next Turn {COUNT} Gains',
  REMOVE_NEXT_TURN_GAINS = 'Remove Next Turn {COUNT} Gains',
  ADD_NEXT_TURN_DISCARD = 'Add Next Turn {COUNT} Discards',
  REMOVE_NEXT_TURN_DISCARD = 'Remove Next Turn {COUNT} Discards',
}

export const futureActionMap: Record<GameLogAction, FutureAction> = {
  [GameLogAction.START_GAME]: FutureAction.START_GAME,
  [GameLogAction.END_GAME]: FutureAction.END_GAME,
  [GameLogAction.SAVE_GAME]: FutureAction.SAVE_GAME,
  [GameLogAction.LOAD_GAME]: FutureAction.LOAD_GAME,
  [GameLogAction.NEXT_TURN]: FutureAction.NEXT_TURN,
  [GameLogAction.BOSS_SKIPPED]: FutureAction.BOSS_SKIPPED,
  [GameLogAction.PAUSE]: FutureAction.PAUSE,
  [GameLogAction.UNPAUSE]: FutureAction.UNPAUSE,
  [GameLogAction.SELECT_PLAYER]: FutureAction.SELECT_PLAYER,
  [GameLogAction.ADD_CARDS]: FutureAction.ADD_CARDS,
  [GameLogAction.REMOVE_CARDS]: FutureAction.REMOVE_CARDS,
  [GameLogAction.ADD_GAINS]: FutureAction.ADD_GAINS,
  [GameLogAction.REMOVE_GAINS]: FutureAction.REMOVE_GAINS,
  [GameLogAction.ADD_DISCARD]: FutureAction.ADD_DISCARD,
  [GameLogAction.REMOVE_DISCARD]: FutureAction.REMOVE_DISCARD,
  [GameLogAction.ADD_TRADE]: FutureAction.ADD_TRADE,
  [GameLogAction.REMOVE_TRADE]: FutureAction.REMOVE_TRADE,
  [GameLogAction.ADD_COMBAT]: FutureAction.ADD_COMBAT,
  [GameLogAction.REMOVE_COMBAT]: FutureAction.REMOVE_COMBAT,
  [GameLogAction.ADD_AUTHORITY]: FutureAction.ADD_AUTHORITY,
  [GameLogAction.REMOVE_AUTHORITY]: FutureAction.REMOVE_AUTHORITY,
  [GameLogAction.ADD_ASSIMILATION]: FutureAction.ADD_ASSIMILATION,
  [GameLogAction.REMOVE_ASSIMILATION]: FutureAction.REMOVE_ASSIMILATION,
  [GameLogAction.SCRAP]: FutureAction.SCRAP,
  [GameLogAction.UNSCRAP]: FutureAction.UNSCRAP,
  [GameLogAction.ADD_NEXT_TURN_CARDS]: FutureAction.ADD_NEXT_TURN_CARDS,
  [GameLogAction.REMOVE_NEXT_TURN_CARDS]: FutureAction.REMOVE_NEXT_TURN_CARDS,
  [GameLogAction.ADD_NEXT_TURN_GAINS]: FutureAction.ADD_NEXT_TURN_GAINS,
  [GameLogAction.REMOVE_NEXT_TURN_GAINS]: FutureAction.REMOVE_NEXT_TURN_GAINS,
  [GameLogAction.ADD_NEXT_TURN_DISCARD]: FutureAction.ADD_NEXT_TURN_DISCARD,
  [GameLogAction.REMOVE_NEXT_TURN_DISCARD]: FutureAction.REMOVE_NEXT_TURN_DISCARD,
  [GameLogAction.ADD_NEXT_TURN_TRADE]: FutureAction.ADD_NEXT_TURN_TRADE,
  [GameLogAction.REMOVE_NEXT_TURN_TRADE]: FutureAction.REMOVE_NEXT_TURN_TRADE,
  [GameLogAction.ADD_NEXT_TURN_COMBAT]: FutureAction.ADD_NEXT_TURN_COMBAT,
  [GameLogAction.REMOVE_NEXT_TURN_COMBAT]: FutureAction.REMOVE_NEXT_TURN_COMBAT,
};
