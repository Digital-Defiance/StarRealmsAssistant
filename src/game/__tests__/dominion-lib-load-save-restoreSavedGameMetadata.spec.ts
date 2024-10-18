import { restoreSavedGameMetadata } from '@/game/dominion-lib-load-save';
import { faker } from '@faker-js/faker';

describe('restoreSavedGameMetadata', () => {
  it('should return an empty array when the input array is empty', () => {
    const result = restoreSavedGameMetadata([]);
    expect(result).toEqual([]);
  });

  it('should restore valid saved game metadata correctly', () => {
    const validMetadata: any[] = [
      {
        id: faker.string.uuid(),
        name: 'Test Game',
        savedAt: new Date().toISOString(), // savedAt is a string here
      },
    ];

    const result = restoreSavedGameMetadata(validMetadata);

    expect(result).toHaveLength(validMetadata.length);
    expect(result[0].id).toEqual(validMetadata[0].id);
    expect(result[0].name).toEqual(validMetadata[0].name);
    expect(result[0].savedAt).toBeInstanceOf(Date);
    expect(result[0].savedAt.toISOString()).toEqual(validMetadata[0].savedAt);
  });

  it('should throw an error when the input array contains invalid saved game metadata', () => {
    const invalidMetadata = [
      {
        id: faker.string.uuid(),
        name: 'Test Game',
        savedAt: 'invalid-timestamp',
      },
    ];

    expect(() => restoreSavedGameMetadata(invalidMetadata)).toThrow('Invalid saved game metadata');
  });

  it('should throw an error when a saved game has undefined savedAt', () => {
    const invalidMetadata = [
      {
        id: faker.string.uuid(),
        name: 'Test Game',
        savedAt: undefined as unknown as string, // Cast undefined as string
      },
    ];

    expect(() => restoreSavedGameMetadata(invalidMetadata)).toThrow('Invalid saved game metadata');
  });

  it('should throw an error if a saved game is missing the savedAt field', () => {
    const missingSavedAt = [
      {
        id: faker.string.uuid(),
        name: 'Test Game',
        savedAt: undefined as unknown as string, // Again cast as `unknown as string`
      },
    ];

    expect(() => restoreSavedGameMetadata(missingSavedAt)).toThrow('Invalid saved game metadata');
  });

  it('should throw an error if savedAt is not a string', () => {
    const nonStringSavedAt = [
      {
        id: faker.string.uuid(),
        name: 'Test Game',
        savedAt: 12345 as unknown as string, // Bypass TypeScript with `unknown`
      },
    ];

    expect(() => restoreSavedGameMetadata(nonStringSavedAt)).toThrow('Invalid saved game metadata');
  });

  it('should throw an error if savedAt is an empty string', () => {
    const emptySavedAt = [
      {
        id: faker.string.uuid(),
        name: 'Test Game',
        savedAt: '', // savedAt is an empty string here
      },
    ];

    expect(() => restoreSavedGameMetadata(emptySavedAt)).toThrow('Invalid saved game metadata');
  });

  it('should throw an error if savedAt is null', () => {
    const nullSavedAt = [
      {
        id: faker.string.uuid(),
        name: 'Test Game',
        savedAt: null as unknown as string, // Force TypeScript to allow passing `null`
      },
    ];

    expect(() => restoreSavedGameMetadata(nullSavedAt)).toThrow('Invalid saved game metadata');
  });
});
