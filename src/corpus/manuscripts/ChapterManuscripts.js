import React from 'react'
import ListForm from 'common/List'
import { createManuscript } from 'corpus/text'
import ManuscriptForm from './ManuscriptForm'
import populateIds from './populateIds'
import { produce } from 'immer'
import { Button } from 'react-bootstrap'

export default function ChapterManuscripts({
  chapter,
  onChange,
  searchBibliography
}) {
  const handeManuscriptsChange = manuscripts =>
    onChange(
      produce(chapter, draft => {
        draft.manuscripts = populateIds(manuscripts)
      })
    )
  return (
    <>
      <ListForm
        noun="manuscript"
        defaultValue={createManuscript({})}
        value={chapter.manuscripts}
        onChange={handeManuscriptsChange}
      >
        {(manuscript, onChange) => (
          <ManuscriptForm
            onChange={onChange}
            manuscript={manuscript}
            searchBibliography={searchBibliography}
          />
        )}
      </ListForm>
      <Button variant="primary" type="submit">
        Save
      </Button>
    </>
  )
}
