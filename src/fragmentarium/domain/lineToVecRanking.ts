export interface LineToVecRanking {
  score: ReadonlyArray<LineToVecScore>
  scoreWeighted: ReadonlyArray<LineToVecScore>
}

export interface LineToVecScore {
  id: string
  script: string
  score: number
}
