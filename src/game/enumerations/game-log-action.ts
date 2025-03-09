export enum GameLogAction {
  START_GAME = 'Started Game',
  END_GAME = 'Ended Game',
  SAVE_GAME = 'Saved Game',
  LOAD_GAME = 'Loaded Game',
  NEXT_TURN = 'Next Turn',
  BOSS_SKIPPED = 'Skipped Boss Turn',
  PAUSE = 'Paused Game',
  UNPAUSE = 'Unpaused Game',
  SELECT_PLAYER = 'Selected Player',
  ADD_TRADE = 'Added {COUNT} Trade',
  REMOVE_TRADE = 'Removed {COUNT} Trade',
  ADD_COMBAT = 'Added {COUNT} Combat',
  REMOVE_COMBAT = 'Removed {COUNT} Combat',
  ADD_AUTHORITY = 'Added {COUNT} Authority',
  REMOVE_AUTHORITY = 'Removed {COUNT} Authority',
  ADD_ASSIMILATION = 'Added {COUNT} Assimilation',
  REMOVE_ASSIMILATION = 'Removed {COUNT} Assimilation',
  ADD_CARDS = 'Added {COUNT} Cards',
  REMOVE_CARDS = 'Removed {COUNT} Cards',
  ADD_GAINS = 'Added {COUNT} Gains',
  REMOVE_GAINS = 'Removed {COUNT} Gains',
  ADD_DISCARD = 'Added {COUNT} Discards',
  REMOVE_DISCARD = 'Removed {COUNT} Discards',
  SCRAP = 'Scrapped {COUNT} Cards',
  UNSCRAP = 'Unscrapped {COUNT} Cards',
  ADD_NEXT_TURN_TRADE = 'Added Next Turn {COUNT} Trade',
  REMOVE_NEXT_TURN_TRADE = 'Removed Next Turn {COUNT} Trade',
  ADD_NEXT_TURN_COMBAT = 'Added Next Turn {COUNT} Combat',
  REMOVE_NEXT_TURN_COMBAT = 'Removed Next Turn {COUNT} Combat',
  ADD_NEXT_TURN_CARDS = 'Added Next Turn {COUNT} Cards',
  REMOVE_NEXT_TURN_CARDS = 'Removed Next Turn {COUNT} Cards',
  ADD_NEXT_TURN_GAINS = 'Added Next Turn {COUNT} Gains',
  REMOVE_NEXT_TURN_GAINS = 'Removed Next Turn {COUNT} Gains',
  ADD_NEXT_TURN_DISCARD = 'Added Next Turn {COUNT} Discards',
  REMOVE_NEXT_TURN_DISCARD = 'Removed Next Turn {COUNT} Discards',
}
