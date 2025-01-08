/**
 * sleep - Asynchronously waits for the specified number of milliseconds.
 *
 * @param {number} ms - The number of milliseconds to wait before resolving the Promise.
 * @returns {Promise<null>} - A Promise that resolves after the specified number of milliseconds.
 */
export const sleep = (ms: number): Promise<null> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
