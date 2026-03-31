'use strict';

const moduleExports = require('./index');
const { getUserName, getUser, fetchData } = moduleExports;

// ---------------------------------------------------------------------------
// module.exports — the line changed in this PR
// ---------------------------------------------------------------------------
describe('module exports', () => {
  it('exports getUserName as a function', () => {
    expect(typeof getUserName).toBe('function');
  });

  it('exports getUser as a function', () => {
    expect(typeof getUser).toBe('function');
  });

  it('exports fetchData as a function', () => {
    expect(typeof fetchData).toBe('function');
  });

  it('exports exactly the three expected symbols', () => {
    const keys = Object.keys(moduleExports);
    expect(keys).toEqual(expect.arrayContaining(['getUserName', 'getUser', 'fetchData']));
    expect(keys).toHaveLength(3);
  });

  it('exported getUserName is the same reference as the named import', () => {
    expect(moduleExports.getUserName).toBe(getUserName);
  });

  it('exported getUser is the same reference as the named import', () => {
    expect(moduleExports.getUser).toBe(getUser);
  });

  it('exported fetchData is the same reference as the named import', () => {
    expect(moduleExports.fetchData).toBe(fetchData);
  });
});

// ---------------------------------------------------------------------------
// getUserName
// ---------------------------------------------------------------------------
describe('getUserName', () => {
  it('returns the uppercased name for a valid user', () => {
    expect(getUserName({ name: 'alice' })).toBe('ALICE');
  });

  it('returns an already-uppercase name unchanged', () => {
    expect(getUserName({ name: 'BOB' })).toBe('BOB');
  });

  it('handles mixed-case names', () => {
    expect(getUserName({ name: 'John Doe' })).toBe('JOHN DOE');
  });

  it('handles an empty string name', () => {
    expect(getUserName({ name: '' })).toBe('');
  });

  it('handles a name that is a single character', () => {
    expect(getUserName({ name: 'x' })).toBe('X');
  });

  // Documents existing bug: null user causes TypeError
  it('throws a TypeError when user is null', () => {
    expect(() => getUserName(null)).toThrow(TypeError);
  });

  // Documents existing bug: undefined user causes TypeError
  it('throws a TypeError when user is undefined', () => {
    expect(() => getUserName(undefined)).toThrow(TypeError);
  });

  // Documents existing bug: null name causes TypeError
  it('throws a TypeError when user.name is null', () => {
    expect(() => getUserName({ name: null })).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// getUser
// ---------------------------------------------------------------------------
describe('getUser', () => {
  let mockQuery;

  beforeEach(() => {
    mockQuery = jest.fn();
    global.db = { query: mockQuery };
  });

  afterEach(() => {
    delete global.db;
    jest.clearAllMocks();
  });

  it('calls db.query with a SQL string containing the provided id', () => {
    mockQuery.mockReturnValue({ id: 1, name: 'Alice' });
    getUser(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('1'));
  });

  it('returns the result from db.query', () => {
    const fakeRow = { id: 42, name: 'Bob' };
    mockQuery.mockReturnValue(fakeRow);
    const result = getUser(42);
    expect(result).toBe(fakeRow);
  });

  it('passes the id value into the query string (SQL injection risk — documents current behavior)', () => {
    mockQuery.mockReturnValue(null);
    getUser('1 OR 1=1');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('1 OR 1=1')
    );
  });

  it('returns undefined when db.query returns undefined', () => {
    mockQuery.mockReturnValue(undefined);
    expect(getUser(99)).toBeUndefined();
  });

  // Boundary: numeric id zero
  it('handles id of 0', () => {
    mockQuery.mockReturnValue(null);
    getUser(0);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('0'));
  });
});

// ---------------------------------------------------------------------------
// fetchData
// ---------------------------------------------------------------------------
describe('fetchData', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
    jest.clearAllMocks();
  });

  it('calls fetch with the provided URL', async () => {
    const fakeJson = jest.fn().mockResolvedValue({ data: 'ok' });
    global.fetch.mockResolvedValue({ json: fakeJson });

    await fetchData('https://example.com/api');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/api');
  });

  it('returns the parsed JSON from the response', async () => {
    const payload = { id: 1, value: 'test' };
    const fakeJson = jest.fn().mockResolvedValue(payload);
    global.fetch.mockResolvedValue({ json: fakeJson });

    const result = await fetchData('https://example.com/api');

    expect(result).toEqual(payload);
  });

  it('calls response.json() exactly once', async () => {
    const fakeJson = jest.fn().mockResolvedValue({});
    global.fetch.mockResolvedValue({ json: fakeJson });

    await fetchData('https://example.com/api');

    expect(fakeJson).toHaveBeenCalledTimes(1);
  });

  // Documents existing bug: no error handling — rejection propagates to caller
  it('propagates a network error when fetch rejects', async () => {
    global.fetch.mockRejectedValue(new Error('Network failure'));

    await expect(fetchData('https://example.com/api')).rejects.toThrow('Network failure');
  });

  // Boundary: empty string URL is passed through as-is
  it('passes an empty string URL directly to fetch', async () => {
    const fakeJson = jest.fn().mockResolvedValue(null);
    global.fetch.mockResolvedValue({ json: fakeJson });

    await fetchData('');

    expect(global.fetch).toHaveBeenCalledWith('');
  });

  // Regression: fetchData is async — always returns a Promise
  it('always returns a Promise', () => {
    const fakeJson = jest.fn().mockResolvedValue({});
    global.fetch.mockResolvedValue({ json: fakeJson });

    const result = fetchData('https://example.com/api');

    expect(result).toBeInstanceOf(Promise);
  });
});