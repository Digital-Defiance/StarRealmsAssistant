import 'module-alias/register';
import { generateLargeGame } from '@/game/dominion-lib-simulate';
import { saveGameData } from '@/game/dominion-lib-load-save';
import { IGame } from '@/game/interfaces/game';
import { DiskStorageService } from '@/game/disk-storage-service';

async function main() {
  // Generate a large game
  const game: IGame = generateLargeGame();

  // Create a disk storage service
  const storageService = new DiskStorageService('./game-storage');

  // Save the game data
  const saveId = saveGameData(game, storageService);

  console.log('Game saved with ID:', saveId);
}

main().catch((error) => {
  console.error('Error:', error);
});
