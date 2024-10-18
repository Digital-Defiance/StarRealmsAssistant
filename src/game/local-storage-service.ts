// storageService.ts

import { IStorageService } from '@/game/interfaces/storage-service';

export class LocalStorageService implements IStorageService {
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
  clear(): void {
    localStorage.clear();
  }
}
