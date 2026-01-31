import { immerable } from 'immer'
import { Text } from 'corpus/domain/text'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { Manuscript } from 'corpus/domain/manuscript'

export class ManuscriptAttestation {
  readonly [immerable] = true

  constructor(
    readonly text: Text,
    readonly chapterId: ChapterId,
    readonly manuscript: Manuscript,
    readonly manuscriptSiglum: string,
  ) {}
}
