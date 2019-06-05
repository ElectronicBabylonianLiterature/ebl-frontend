// @flow
import _ from 'lodash'
import { Seq, Range } from 'immutable'
import type { Manuscript } from './text'

function createIdRange (existingIds) {
  return Range((existingIds.max() || 0) + 1)
}

function setIds (manuscripts, ids) {
  function setId (manuscript, manuscripts) {
    return _.isNil(manuscript.id)
      ? Seq.Indexed.of(manuscript.set('id', ids.first())).concat(
        setIds(manuscripts, ids.rest())
      )
      : Seq.Indexed.of(manuscript).concat(setIds(manuscripts, ids))
  }

  return manuscripts.isEmpty()
    ? Seq.Indexed()
    : setId(manuscripts.first(), manuscripts.rest())
}

export default function populateIds (manuscripts: Seq.Indexed<Manuscript>) {
  const existingIds = manuscripts.map(manuscript => manuscript.id)

  return existingIds.includes(null)
    ? setIds(manuscripts, createIdRange(existingIds)).toList()
    : manuscripts
}
