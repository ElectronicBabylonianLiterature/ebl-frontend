import { immerable } from 'immer'
import { Text } from 'corpus/domain/text'
import { ChapterId } from 'transliteration/domain/chapter-id'

export class UncertainFragmentAttestation {
  readonly [immerable] = true

  constructor(readonly text: Text, readonly chapterId: ChapterId) {}
}
