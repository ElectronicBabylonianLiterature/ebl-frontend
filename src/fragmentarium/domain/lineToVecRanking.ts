import { Script, ScriptDto } from './fragment'

export interface LineToVecRanking {
  score: ReadonlyArray<LineToVecScore>
  scoreWeighted: ReadonlyArray<LineToVecScore>
}

export interface LineToVecScore {
  museumNumber: string
  script: Script
  score: number
}

export interface LineToVecScoreDto extends Omit<LineToVecScore, 'script'> {
  script: ScriptDto
}

export interface LineToVecRankingDto {
  score: readonly LineToVecScoreDto[]
  scoreWeighted: readonly LineToVecScoreDto[]
}
