import assert from 'node:assert/strict'
import test from 'node:test'
import { types } from 'pg'
import { configurePostgresDateParser, POSTGRES_DATE_OID } from './postgres-date'

test('PostgreSQL date values remain valid HTML date input values', () => {
  const originalParser = types.getTypeParser(POSTGRES_DATE_OID)

  try {
    configurePostgresDateParser()
    assert.equal(types.getTypeParser(POSTGRES_DATE_OID)('2026-09-15'), '2026-09-15')
  } finally {
    types.setTypeParser(POSTGRES_DATE_OID, originalParser)
  }
})
