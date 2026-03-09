import { TextId } from 'transliteration/domain/text-id'
import isEmpty from 'lodash/fp/isEmpty'
import join from 'lodash/fp/join'
import reject from 'lodash/fp/reject'
import flow from 'lodash/fp/flow'

export const defaultName = '-'

export interface ChapterId {
  readonly textId: TextId
  readonly stage: string
  readonly name: string
}

export function chapterIdToString(id: ChapterId): string {
  return flow(
    reject(isEmpty),
    join(' '),
  )([id.stage, id.name !== defaultName ? id.name : ''])
}
