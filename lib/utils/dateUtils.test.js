// Example Jest test for dateUtils.js
import { calculateExpiryDate, formatDate } from '@/lib/utils/dateUtils';

describe('dateUtils', () => {
  test('calculateExpiryDate adds correct days based on category', () => {
    const purchaseDate = '2023-01-01';
    expect(calculateExpiryDate(purchaseDate, 'meat').toISOString().split('T')[0]).toBe('2023-01-04');
    expect(calculateExpiryDate(purchaseDate, 'dairy').toISOString().split('T')[0]).toBe('2023-01-08');
  });
  
  test('formatDate returns date in correct format', () => {
    const date = new Date('2023-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2023');
  });
});