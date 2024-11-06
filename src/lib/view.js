/* eslint-disable auto-js-extension/auto-js-extension */
// @ts-check
import { Console } from '@woowacourse/mission-utils';

/**
 *
 * @param {string} query
 * @returns {Promise<string>}
 */
export async function input(query) {
  const result = await Console.readLineAsync(`${query}\n`);

  return result;
}

/**
 *
 * @param {string} message
 * @returns {void}
 */
export function output(message) {
  Console.print(message);
}
