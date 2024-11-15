import { IStorageService } from '@/game/interfaces/storage-service';
import * as fs from 'fs';
import * as path from 'path';

export class DiskStorageService implements IStorageService {
  private readonly storageDir: string;

  constructor(storageDir: string) {
    this.storageDir = storageDir;

    // Ensure the storage directory exists
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
  }

  setItem(key: string, value: string): void {
    const filePath = path.join(this.storageDir, key);
    fs.writeFileSync(filePath, value, 'utf8');
  }

  getItem(key: string): string | null {
    const filePath = path.join(this.storageDir, key);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  }

  removeItem(key: string): void {
    const filePath = path.join(this.storageDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  clear(): void {
    fs.rmdirSync(this.storageDir, { recursive: true });
    fs.mkdirSync(this.storageDir, { recursive: true });
  }
}
