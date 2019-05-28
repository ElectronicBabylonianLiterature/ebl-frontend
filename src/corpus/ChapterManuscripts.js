import React from 'react'
import ListForm from 'common/List'
import { createManuscript } from './text'
import ManuscriptForm from './ManuscriptForm'
import populateIds from './populateIds'

export default function ChapterManuscripts ({
  chapter,
  onChange,
  searchBibliography
}) {
  const handeManuscriptsChange = manuscripts =>
    onChange(chapter.set('manuscripts', populateIds(manuscripts)))
  return (
    <ListForm
      noun='manuscript'
      default={createManuscript()}
      value={chapter.manuscripts}
      onChange={handeManuscriptsChange}
    >
      {chapter.manuscripts.map((manuscript, index) => (
        <ManuscriptForm
          key={index}
          manuscript={manuscript}
          searchBibliography={searchBibliography}
        />
      ))}
    </ListForm>
  )
}
