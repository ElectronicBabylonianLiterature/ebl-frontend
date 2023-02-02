export interface QueryItem {
  museumNumber: string
  matchingLines: readonly number[]
  matchCount: number
}

export interface QueryResult {
  items: readonly QueryItem[]
  matchCountTotal: number
}
