import MuseumNumber from 'fragmentarium/domain/MuseumNumber'

export interface QueryItem {
  id_: string
  museumNumber: MuseumNumber
  matchingLines: readonly number[]
  matchCount: number
}

export interface QueryResult {
  items: readonly QueryItem[]
  matchCountTotal: number
}
