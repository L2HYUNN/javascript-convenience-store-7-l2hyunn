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
