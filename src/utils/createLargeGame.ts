import 'module-alias/register';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateLargeGame } from '@/game/starrealms-lib-simulate';
import { saveGameData } from '@/game/starrealms-lib-load-save';
import { IGame } from '@/game/interfaces/game';
import { DiskStorageService } from '@/game/disk-storage-service';
import { SaveGameStorageKeyPrefix } from '@/game/constants';
import { copyFileSync } from 'fs';
import { join } from 'path';

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('noEnd', {
      type: 'boolean',
      description:
        'Prevent the generated game from adding the END_GAME log and setting the state to game over',
    })
    .parseSync();

  const endGame = !argv.noEnd;

  const storageLocation = './game-storage';

  // pick a random number of turns between 50 and 60
  const numTurns = Math.floor(Math.random() * 11) + 50;
  // Generate a large game
  const game: IGame = generateLargeGame(numTurns, endGame);

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
