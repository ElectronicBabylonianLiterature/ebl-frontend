import { LemmatizationToken } from 'transliteration/domain/Lemmatization'

export type LineLemmatization = [
  readonly LemmatizationToken[],
  readonly LemmatizationToken[][],
]
