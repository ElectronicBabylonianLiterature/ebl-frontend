import _ from 'lodash'
import { Seq, Range } from 'immutable'

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

export default function populateIds (manuscripts) {
  const existingIds = manuscripts.map(manuscript => manuscript.id)

  return existingIds.includes(null)
    ? setIds(manuscripts, createIdRange(existingIds)).toList()
    : manuscripts
}
