import { hello } from '../index';

describe('state-core', () => {
  describe('hello function', () => {
    it('should return a formatted greeting', () => {
      const result = hello('World');
      expect(result).toBe('Hello, World!');
    });

    it('should handle empty strings', () => {
      const result = hello('');
      expect(result).toBe('Hello, !');
    });
  });
});
