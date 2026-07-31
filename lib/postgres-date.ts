import { types } from 'pg'

export const POSTGRES_DATE_OID = 1082

export function configurePostgresDateParser(): void {
  types.setTypeParser(POSTGRES_DATE_OID, (value) => value)
}
