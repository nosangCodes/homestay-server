const pick = <T extends Record<string, any>, K extends keyof T>(
  object: T,
  keys: K[]
): Pick<T, K> =>
  // Use reduce to iterate over the keys array and construct the new object
  keys.reduce(
    (obj, key) =>
      // Check if the source object has the specified key
      Object.prototype.hasOwnProperty.call(object, key)
        ? // If the key exists in the source object, add it to the new object
          { ...obj, [key]: object[key] }
        : // If the key does not exist, return the current object unchanged
          obj,
    {} as Pick<T, K> // Initialize the accumulator object as an empty object with the appropriate type
  );

export default pick;
