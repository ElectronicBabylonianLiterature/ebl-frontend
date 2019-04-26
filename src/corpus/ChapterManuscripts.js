import React from 'react'
import _ from 'lodash'
import { Seq, Range } from 'immutable'
import ListForm from 'common/List'
import { createManuscript } from './text'
import ManuscriptForm from './ManuscriptForm'

function populateIds (manuscripts) {
  const existingIds = manuscripts.map(manuscript => manuscript.id)
  if (existingIds.includes(null)) {
    const ids = Range((existingIds.max() || 0) + 1)
    const map_ = (manuscripts, ids) => {
      if (manuscripts.isEmpty()) {
        return Seq.Indexed()
      } else {
        const manuscript = manuscripts.first()
        return _.isNil(manuscript.id)
          ? Seq.Indexed.of(manuscript.set('id', ids.first())).concat(map_(manuscripts.rest(), ids.rest()))
          : Seq.Indexed.of(manuscript).concat(map_(manuscripts.rest(), ids))
      }
    }
    return map_(manuscripts, ids).toList()
  } else {
    return manuscripts
  }
}

export default function ChapterManuscripts ({ chapter, onChange, searchBibliography }) {
  const handeManuscriptsChange = manuscripts => onChange(chapter.set('manuscripts', populateIds(manuscripts)))
  return <ListForm noun='manuscript' default={createManuscript()} value={chapter.manuscripts} onChange={handeManuscriptsChange}>
    {chapter.manuscripts.map((manuscript, index) => <ManuscriptForm key={index} manuscript={manuscript} searchBibliography={searchBibliography} />)}
  </ListForm>
}
