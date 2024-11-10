import { getISODateString } from '../lib/utils.js';
import { mockNowDate } from './utils.js';

describe('utils', () => {
  describe('getISODateString', () => {
    it('현재 날짜를 YYYY-MM-DD 형식으로 반환해야 한다', () => {
      mockNowDate('2024-11-10');

      const result = getISODateString();

      expect(result).toBe('2024-11-10');
    });
  });
});
