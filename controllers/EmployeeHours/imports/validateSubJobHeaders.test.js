const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  validateSubJobHeaders,
  EXPECTED_HEADERS,
} = require('./validateSubJobHeaders');

test('accepts an exact-match header row', () => {
  const result = validateSubJobHeaders(['JOB#', 'Comp', 'NAME', 'SubJob#', 'Desc']);
  assert.deepEqual(result, {
    valid: true,
    headers: ['JOB#', 'Comp', 'NAME', 'SubJob#', 'Desc'],
  });
});

test('trims surrounding whitespace before comparing', () => {
  const result = validateSubJobHeaders([' JOB# ', 'Comp', 'NAME ', ' SubJob#', 'Desc']);
  assert.equal(result.valid, true);
  assert.deepEqual(result.headers, EXPECTED_HEADERS);
});

test('rejects wrong column order', () => {
  const result = validateSubJobHeaders(['JOB#', 'NAME', 'Comp', 'SubJob#', 'Desc']);
  assert.equal(result.valid, false);
  assert.match(result.reason, /column 2/);
});

test('rejects a missing column (too few headers)', () => {
  const result = validateSubJobHeaders(['JOB#', 'NAME', 'SubJob#', 'Desc']);
  assert.equal(result.valid, false);
  assert.match(result.reason, /expected 5 columns, received 4/);
});

test('rejects an extra column (too many headers)', () => {
  const result = validateSubJobHeaders(['JOB#', 'Comp', 'NAME', 'SubJob#', 'Desc', 'Extra']);
  assert.equal(result.valid, false);
  assert.match(result.reason, /received 6/);
});

test('rejects a case mismatch', () => {
  const result = validateSubJobHeaders(['job#', 'Comp', 'NAME', 'SubJob#', 'Desc']);
  assert.equal(result.valid, false);
  assert.match(result.reason, /column 1/);
});

test('treats null/undefined header cells as empty strings', () => {
  const result = validateSubJobHeaders([null, undefined, 'NAME', 'SubJob#', 'Desc']);
  assert.equal(result.valid, false);
  assert.match(result.reason, /column 1/);
});

test('rejects a non-array input (e.g. empty sheet)', () => {
  const result = validateSubJobHeaders(undefined);
  assert.equal(result.valid, false);
  assert.match(result.reason, /received 0/);
});
