import React from 'react'
import ListForm from 'common/List'
import { createManuscript } from 'corpus/text'
import ManuscriptForm from './ManuscriptForm'
import populateIds from './populateIds'
import { produce } from 'immer'
import { Button, Form } from 'react-bootstrap'

export default function ChapterManuscripts({
  chapter,
  onChange,
  onSave,
  searchBibliography,
  disabled,
}) {
  const handeManuscriptsChange = (manuscripts) =>
    onChange(
      produce(chapter, (draft) => {
        draft.manuscripts = populateIds(manuscripts)
      })
    )
  return (
    <Form>
      <fieldset disabled={disabled}>
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
        <Button onClick={onSave}>Save manuscripts</Button>
      </fieldset>
    </Form>
  )
}
