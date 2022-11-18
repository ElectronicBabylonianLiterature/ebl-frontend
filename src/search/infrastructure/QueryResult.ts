import MuseumNumber from 'fragmentarium/domain/MuseumNumber'

type LemmaSequence = ReadonlyArray<ReadonlyArray<string>>

export interface QueryItem {
  id_: string
  museumNumber: MuseumNumber
  matchingLines: readonly number[]
  matchCount: number
  lemmaSequences?: ReadonlyArray<LemmaSequence>
}

export interface QueryResult {
  items: readonly QueryItem[]
  matchCountTotal: number
}
