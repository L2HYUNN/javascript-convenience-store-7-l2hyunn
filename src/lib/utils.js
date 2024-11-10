import { DateTimes } from '@woowacourse/mission-utils';

export function getISODateString() {
  return DateTimes.now().toISOString().split('T')[0];
}
