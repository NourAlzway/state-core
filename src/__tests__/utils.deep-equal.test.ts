/**
 * @jest-environment node
 */

import { deepEqual } from '../utils';

describe('utils - deepEqual', () => {
  describe('primitive values', () => {
    it('should return true for identical primitives', () => {
      const a = 42;
      const b = 42;

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });

    it('should return true for same string values', () => {
      const a = 'hello';
      const b = 'hello';

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });

    it('should return true for same boolean values', () => {
      const a = true;
      const b = true;

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });

    it('should return false for different primitive types', () => {
      const a = 42;
      const b = '42';

      const result = deepEqual(a, b);

      expect(result).toBe(false);
    });

    it('should return false for different values of same type', () => {
      const a = 42;
      const b = 43;

      const result = deepEqual(a, b);

      expect(result).toBe(false);
    });
  });

  describe('null and undefined handling', () => {
    it('should return true for both null values', () => {
      const a = null;
      const b = null;

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });

    it('should return true for both undefined values', () => {
      const a = undefined;
      const b = undefined;

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });

    it('should return false for null vs undefined', () => {
      const a = null;
      const b = undefined;

      const result = deepEqual(a, b);

      expect(result).toBe(false);
    });

    it('should return false for null vs other values', () => {
      const a = null;
      const b = 0;

      const result = deepEqual(a, b);

      expect(result).toBe(false);
    });
  });

  describe('Date objects', () => {
    it('should return true for dates with same time', () => {
      const date = new Date('2024-01-01');
      const a = date;
      const b = new Date(date.getTime());

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });

    it('should return false for dates with different time', () => {
      const a = new Date('2024-01-01');
      const b = new Date('2024-01-02');

      const result = deepEqual(a, b);

      expect(result).toBe(false);
    });
  });

  describe('arrays', () => {
    it('should return true for identical arrays', () => {
      const a = [1, 2, 3];
      const b = [1, 2, 3];

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });

    it('should return true for empty arrays', () => {
      const a: number[] = [];
      const b: number[] = [];

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });

    it('should return false for arrays with different lengths', () => {
      const a = [1, 2, 3];
      const b = [1, 2];

      const result = deepEqual(a, b);

      expect(result).toBe(false);
    });

    it('should return false for arrays with different values', () => {
      const a = [1, 2, 3];
      const b = [1, 2, 4];

      const result = deepEqual(a, b);

      expect(result).toBe(false);
    });

    it('should handle nested arrays', () => {
      const a = [
        [1, 2],
        [3, 4],
      ];
      const b = [
        [1, 2],
        [3, 4],
      ];

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });

    it('should return false for array vs non-array', () => {
      const a = [1, 2, 3];
      const b = { 0: 1, 1: 2, 2: 3, length: 3 };

      const result = deepEqual(a, b);

      expect(result).toBe(false);
    });
  });

  describe('objects', () => {
    it('should return true for identical objects', () => {
      const a = { name: 'John', age: 30 };
      const b = { name: 'John', age: 30 };

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });

    it('should return true for empty objects', () => {
      const a = {};
      const b = {};

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });

    it('should return false for objects with different keys', () => {
      const a = { name: 'John', age: 30 };
      const b = { name: 'John', city: 'NYC' };

      const result = deepEqual(a, b);

      expect(result).toBe(false);
    });

    it('should return false for objects with different values', () => {
      const a = { name: 'John', age: 30 };
      const b = { name: 'John', age: 31 };

      const result = deepEqual(a, b);

      expect(result).toBe(false);
    });

    it('should handle nested objects', () => {
      const a = { user: { name: 'John', age: 30 }, count: 5 };
      const b = { user: { name: 'John', age: 30 }, count: 5 };

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });

    it('should return false for nested objects with differences', () => {
      const a = { user: { name: 'John', age: 30 }, count: 5 };
      const b = { user: { name: 'Jane', age: 30 }, count: 5 };

      const result = deepEqual(a, b);

      expect(result).toBe(false);
    });
  });

  describe('mixed types', () => {
    it('should handle complex nested structures', () => {
      const a = {
        users: [
          { name: 'John', dates: [new Date('2024-01-01')] },
          { name: 'Jane', dates: [new Date('2024-01-02')] },
        ],
        config: { enabled: true, count: null },
      };
      const b = {
        users: [
          { name: 'John', dates: [new Date('2024-01-01')] },
          { name: 'Jane', dates: [new Date('2024-01-02')] },
        ],
        config: { enabled: true, count: null },
      };

      const result = deepEqual(a, b);

      expect(result).toBe(true);
    });
  });
});
