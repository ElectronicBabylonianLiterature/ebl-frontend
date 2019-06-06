// @flow
import _ from 'lodash'
import type { Manuscript } from './text'
import { produce } from 'immer'

function calculateNextId (manuscripts) {
  const existingIds = manuscripts.map(manuscript => manuscript.id)
  const maxId = _.max(existingIds) || 0
  return maxId + 1
}

export default function populateIds (manuscripts: Array<Manuscript>) {
  const firstId = calculateNextId(manuscripts)
  return produce(manuscripts, draft => {
    draft
      .filter(manuscript => _.isNil(manuscript.id))
      .forEach((manuscript, index) => {
        manuscript.id = firstId + index
      })
  })
}
