import { InvalidNumberPlayersError } from '@/game/errors/invalid-number-players';

export interface IProphecyMat {
  suns: number;
}

export function calculateInitialSunTokens(numPlayers: number): IProphecyMat {
  // Put 5 Sun tokens on the Prophecy for 2 players, 8 for 3 players, 10 for 4 players, 12 for 5 players, and 13 for 6 players.
  if (numPlayers === 2) {
    return {
      suns: 5,
    };
  } else if (numPlayers === 3) {
    return {
      suns: 8,
    };
  } else if (numPlayers === 4) {
    return {
      suns: 10,
    };
  } else if (numPlayers === 5) {
    return {
      suns: 12,
    };
  } else if (numPlayers === 6) {
    return {
      suns: 13,
    };
  } else {
    throw new InvalidNumberPlayersError();
  }
}
