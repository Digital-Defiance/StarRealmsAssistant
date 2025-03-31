/**
 * Deeply clones the provided value.
 *
 * This function creates a complete deep copy of the input. For primitive values and non-object types, it returns the value unchanged. If the value is a Date, a new Dat     e instance is created with the same time. Arrays are recursively cloned, and plain objects have each of their own enumerable properties deep cloned.
 *
 * @param obj - The value to deep clone.
 * @returns A deep clone of the input value.
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    const arrCopy = [] as unknown[];
    for (const item of obj) {
      arrCopy.push(deepClone(item));
    }
    return arrCopy as unknown as T;
  }

  // Handle Objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objCopy = {} as { [key: string]: any };
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      objCopy[key] = deepClone(obj[key]);
    }
  }
  return objCopy as T;
}

/**
 * Determines whether the provided Date object represents a valid date.
 *
 * The function verifies that the object is an instance of Date and that its time value is valid
 * (i.e., not NaN), serving as a type guard.
 *
 * @param date - The Date object to validate.
 * @returns True if the Date object is valid; otherwise, false.
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Determines whether the provided value is a string that can be interpreted as a valid date.
 *
 * If the input is not a string, the function immediately returns false.
 *
 * @param dateString - The value to check.
 * @returns True if the input is a string representing a valid date; otherwise, false.
 */
export function isValidDateString(dateString: string | number | Date): boolean {
  if (dateString instanceof Date) {
    return isValidDate(dateString);
  }
  if (typeof dateString === 'number') {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
  if (typeof dateString === 'string') {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
  return false;
}
