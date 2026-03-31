'use strict';

const { getUserName } = require('./index');

describe('getUserName', () => {
  describe('normal name transformations', () => {
    test('returns uppercased name for a lowercase name', () => {
      expect(getUserName({ name: 'alice' })).toBe('ALICE');
    });

    test('returns uppercased name for a mixed-case name', () => {
      expect(getUserName({ name: 'jOhN dOe' })).toBe('JOHN DOE');
    });

    test('returns the same string when name is already uppercase', () => {
      expect(getUserName({ name: 'BOB' })).toBe('BOB');
    });

    test('returns an empty string when name is an empty string', () => {
      expect(getUserName({ name: '' })).toBe('');
    });

    test('handles names with non-alphabetic characters (numbers, symbols)', () => {
      expect(getUserName({ name: 'user_42!' })).toBe('USER_42!');
    });

    test('handles names with accented / unicode characters', () => {
      // toUpperCase is locale-independent by default; basic latin letters are uppercased
      expect(getUserName({ name: 'café' })).toBe('CAFÉ');
    });

    test('handles whitespace-only name', () => {
      expect(getUserName({ name: '   ' })).toBe('   ');
    });
  });

  describe('error cases', () => {
    test('throws TypeError when user is null', () => {
      expect(() => getUserName(null)).toThrow(TypeError);
    });

    test('throws TypeError when user is undefined', () => {
      expect(() => getUserName(undefined)).toThrow(TypeError);
    });

    test('throws TypeError when user object has no name property', () => {
      expect(() => getUserName({})).toThrow(TypeError);
    });

    test('throws TypeError when user.name is null', () => {
      expect(() => getUserName({ name: null })).toThrow(TypeError);
    });

    test('throws TypeError when user.name is a number', () => {
      // numbers do not have toUpperCase; this is a boundary/regression case
      expect(() => getUserName({ name: 42 })).toThrow(TypeError);
    });
  });
});