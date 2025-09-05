/**
 * @jest-environment node
 */

import { deepClone } from '../utils';

describe('utils - deepClone', () => {
  describe('primitive values', () => {
    it('should return same value for numbers', () => {
      const original = 42;

      const cloned = deepClone(original);

      expect(cloned).toBe(original);
      expect(typeof cloned).toBe('number');
    });

    it('should return same value for strings', () => {
      const original = 'hello';

      const cloned = deepClone(original);

      expect(cloned).toBe(original);
      expect(typeof cloned).toBe('string');
    });

    it('should return same value for booleans', () => {
      const original = true;

      const cloned = deepClone(original);

      expect(cloned).toBe(original);
      expect(typeof cloned).toBe('boolean');
    });
  });

  describe('null and undefined handling', () => {
    it('should return null for null input', () => {
      const original = null;

      const cloned = deepClone(original);

      expect(cloned).toBe(null);
    });

    it('should return undefined for undefined input', () => {
      const original = undefined;

      const cloned = deepClone(original);

      expect(cloned).toBe(undefined);
    });
  });

  describe('Date objects', () => {
    it('should create new Date instance with same time', () => {
      const original = new Date('2024-01-01');

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned).toBeInstanceOf(Date);
    });
  });

  describe('arrays', () => {
    it('should create new array with same elements', () => {
      const original = [1, 2, 3];

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(Array.isArray(cloned)).toBe(true);
    });

    it('should handle empty arrays', () => {
      const original: number[] = [];

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(Array.isArray(cloned)).toBe(true);
    });

    it('should deeply clone nested arrays', () => {
      const original = [
        [1, 2],
        [3, 4],
      ];

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[0]).not.toBe(original[0]);
      expect(cloned[1]).not.toBe(original[1]);
    });

    it('should maintain independence after cloning', () => {
      const original = [{ value: 1 }, { value: 2 }];

      const cloned = deepClone(original);
      cloned[0].value = 99;

      expect(original[0].value).toBe(1);
      expect(cloned[0].value).toBe(99);
    });
  });

  describe('objects', () => {
    it('should create new object with same properties', () => {
      const original = { name: 'John', age: 30 };

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should handle empty objects', () => {
      const original = {};

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should deeply clone nested objects', () => {
      const original = { user: { name: 'John', age: 30 }, count: 5 };

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.user).not.toBe(original.user);
    });

    it('should maintain independence after cloning nested objects', () => {
      const original = { user: { name: 'John', age: 30 }, count: 5 };

      const cloned = deepClone(original);
      cloned.user.name = 'Jane';

      expect(original.user.name).toBe('John');
      expect(cloned.user.name).toBe('Jane');
    });

    it('should handle objects with hasOwnProperty', () => {
      const original = Object.create(null);
      original.name = 'John';
      original.age = 30;

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });
  });

  describe('circular references', () => {
    it('should handle circular object references', () => {
      const original: any = { name: 'John' };
      original.self = original;

      const cloned = deepClone(original);

      expect(cloned.name).toBe('John');
      expect(cloned.self).toBe(cloned);
      expect(cloned).not.toBe(original);
    });

    it('should handle circular array references', () => {
      const original: any[] = [1, 2, 3];
      original.push(original);

      const cloned = deepClone(original);

      expect(cloned).toHaveLength(4);
      expect(cloned[0]).toBe(1);
      expect(cloned[3]).toBe(cloned);
      expect(cloned).not.toBe(original);
    });

    it('should handle complex circular structures', () => {
      const original: any = {
        name: 'root',
        children: [
          { name: 'child1', parent: null },
          { name: 'child2', parent: null },
        ],
      };
      original.children[0].parent = original;
      original.children[1].parent = original;

      const cloned = deepClone(original);

      expect(cloned.name).toBe('root');
      expect(cloned.children[0].parent).toBe(cloned);
      expect(cloned.children[1].parent).toBe(cloned);
      expect(cloned).not.toBe(original);
    });
  });

  describe('mixed types', () => {
    it('should handle complex nested structures with different types', () => {
      const original = {
        users: [
          { name: 'John', birthDate: new Date('1990-01-01'), active: true },
          { name: 'Jane', birthDate: new Date('1992-05-15'), active: false },
        ],
        config: {
          settings: { theme: 'dark', count: 42 },
          metadata: null,
          tags: ['admin', 'user'],
        },
      };

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.users).not.toBe(original.users);
      expect(cloned.users[0]).not.toBe(original.users[0]);
      expect(cloned.users[0].birthDate).not.toBe(original.users[0].birthDate);
      expect(cloned.config.settings).not.toBe(original.config.settings);
      expect(cloned.config.tags).not.toBe(original.config.tags);
    });
  });
});
