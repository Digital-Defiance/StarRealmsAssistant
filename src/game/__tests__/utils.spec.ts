import { deepClone, isValidDate } from '@/game/utils';

describe('deepClone', () => {
  it('should clone primitive types correctly', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
  });

  it('should clone Date objects correctly', () => {
    const date = new Date();
    const clonedDate = deepClone(date);
    expect(clonedDate).toEqual(date);
    expect(clonedDate).not.toBe(date);
  });

  it('should clone arrays containing primitive types correctly', () => {
    const arr = [1, 'two', true, null, undefined];
    const clonedArr = deepClone(arr);
    expect(clonedArr).toEqual(arr);
    expect(clonedArr).not.toBe(arr);
  });

  it('should clone arrays containing objects correctly', () => {
    const arr = [{ a: 1 }, { b: 2 }];
    const clonedArr = deepClone(arr);
    expect(clonedArr).toEqual(arr);
    expect(clonedArr).not.toBe(arr);
    expect(clonedArr[0]).not.toBe(arr[0]);
    expect(clonedArr[1]).not.toBe(arr[1]);
  });

  it('should clone nested objects correctly', () => {
    const obj = { a: { b: { c: 1 } } };
    const clonedObj = deepClone(obj);
    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj);
    expect(clonedObj.a).not.toBe(obj.a);
    expect(clonedObj.a.b).not.toBe(obj.a.b);
  });

  it('should clone objects with various data types correctly', () => {
    const obj = {
      num: 1,
      str: 'string',
      bool: true,
      nil: null,
      undef: undefined,
      date: new Date(),
      arr: [1, 2, 3],
      nested: { a: 1, b: [2, 3] },
    };
    const clonedObj = deepClone(obj);
    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj);
    expect(clonedObj.date).toEqual(obj.date);
    expect(clonedObj.date).not.toBe(obj.date);
    expect(clonedObj.arr).toEqual(obj.arr);
    expect(clonedObj.arr).not.toBe(obj.arr);
    expect(clonedObj.nested).toEqual(obj.nested);
    expect(clonedObj.nested).not.toBe(obj.nested);
  });
});

describe('isValidDate', () => {
  it('should return true for valid Date objects', () => {
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate(new Date('2023-01-01T00:00:00Z'))).toBe(true);
  });

  it('should return false for invalid Date objects', () => {
    expect(isValidDate(new Date('invalid date'))).toBe(false);
  });

  it('should return false for non-Date objects', () => {
    expect(isValidDate('2023-01-01')).toBe(false);
    expect(isValidDate(1672531199000)).toBe(false); // timestamp
    expect(isValidDate({})).toBe(false);
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
    expect(isValidDate([])).toBe(false);
  });
});
