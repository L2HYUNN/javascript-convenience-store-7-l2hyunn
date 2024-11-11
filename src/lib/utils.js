/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */
import { DateTimes } from '@woowacourse/mission-utils';

export function getISODateString() {
  return DateTimes.now().toISOString().split('T')[0];
}

export function parseMarkdownFileContents(fileContents) {
  return fileContents
    .trim()
    .split('\n')
    .slice(1)
    .map((fileContent) => fileContent.split(','));
}

export async function safeInput(input, { onInput, onError }) {
  while (true) {
    try {
      const result = await input();
      onInput(result);

      return result;
    } catch (error) {
      onError(error);
    }
  }
}
