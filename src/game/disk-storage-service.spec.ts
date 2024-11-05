import { DiskStorageService } from '@/game/disk-storage-service';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

describe('DiskStorageService', () => {
  const TEST_STORAGE_DIR = './test-storage';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create the storage directory if it does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    const mkdirSyncMock = fs.mkdirSync as jest.Mock;

    new DiskStorageService(TEST_STORAGE_DIR);

    expect(mkdirSyncMock).toHaveBeenCalledWith(TEST_STORAGE_DIR, { recursive: true });
  });

  test('should not create the storage directory if it exists', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    const mkdirSyncMock = fs.mkdirSync as jest.Mock;

    new DiskStorageService(TEST_STORAGE_DIR);

    expect(mkdirSyncMock).not.toHaveBeenCalled();
  });

  test('should set and get an item', () => {
    const storageService = new DiskStorageService(TEST_STORAGE_DIR);
    const key = 'test-key';
    const value = 'test-value';
    const filePath = path.join(TEST_STORAGE_DIR, key);

    storageService.setItem(key, value);

    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, value, 'utf8');

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(value);

    const retrievedValue = storageService.getItem(key);

    expect(retrievedValue).toBe(value);
    expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
  });

  test('should return null for a non-existent item', () => {
    const storageService = new DiskStorageService(TEST_STORAGE_DIR);
    const key = 'non-existent-key';

    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const retrievedValue = storageService.getItem(key);

    expect(retrievedValue).toBeNull();
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  test('should remove an item', () => {
    const storageService = new DiskStorageService(TEST_STORAGE_DIR);
    const key = 'test-key';
    const filePath = path.join(TEST_STORAGE_DIR, key);

    (fs.existsSync as jest.Mock).mockReturnValue(true);

    storageService.removeItem(key);

    expect(fs.unlinkSync).toHaveBeenCalledWith(filePath);
  });

  test('should not remove a non-existent item', () => {
    const storageService = new DiskStorageService(TEST_STORAGE_DIR);
    const key = 'non-existent-key';

    (fs.existsSync as jest.Mock).mockReturnValue(false);

    storageService.removeItem(key);

    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });
});
