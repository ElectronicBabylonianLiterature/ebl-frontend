import { Script } from './fragment'

export interface LineToVecRanking {
  score: ReadonlyArray<LineToVecScore>
  scoreWeighted: ReadonlyArray<LineToVecScore>
}

export interface LineToVecScore {
  museumNumber: string
  script: Script
  score: number
}
