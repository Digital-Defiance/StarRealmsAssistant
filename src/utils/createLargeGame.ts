import 'module-alias/register';
import { generateLargeGame } from '@/game/dominion-lib-simulate';
import { saveGameData } from '@/game/dominion-lib-load-save';
import { IGame } from '@/game/interfaces/game';
import { DiskStorageService } from '@/game/disk-storage-service';
import { SaveGameStorageKeyPrefix } from '@/game/constants';
import { copyFileSync } from 'fs';
import { join } from 'path';

async function main() {
  const storageLocation = './game-storage';

  // pick a random number of turns between 50 and 60
  const numTurns = Math.floor(Math.random() * 11) + 50;
  // Generate a large game
  const game: IGame = generateLargeGame(numTurns);

  // Create a disk storage service
  const storageService = new DiskStorageService(storageLocation);

  // Save the game data
  const saveId = saveGameData(game, storageService);

  const savedFilename = `${SaveGameStorageKeyPrefix}${saveId}`;
  const savedFilePath = join(storageLocation, savedFilename);
  const jsonFilePath = join(storageLocation, `Save.json`);

  // copy the saved game to a json file
  copyFileSync(savedFilePath, jsonFilePath);

  console.log('Game saved with ID:', saveId);
  console.log('Copied saved game to:', jsonFilePath);
}

main().catch((error: unknown) => {
  console.error('Error:', error);
});
