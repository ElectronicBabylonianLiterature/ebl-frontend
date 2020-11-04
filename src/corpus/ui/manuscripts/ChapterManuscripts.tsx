import React from 'react'
import Promise from 'bluebird'
import ListForm from 'common/List'
import { createManuscript, Chapter, Manuscript } from 'corpus/domain/text'
import ManuscriptForm from './ManuscriptForm'
import populateIds from 'corpus/application/populateIds'
import { castDraft, produce } from 'immer'
import { Button, Form } from 'react-bootstrap'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

interface Props {
  chapter: Chapter
  onChange: (chapter: Chapter) => void
  onSave: () => void
  searchBibliography: (query: string) => Promise<readonly BibliographyEntry[]>
  disabled: boolean
}

export default function ChapterManuscripts({
  chapter,
  onChange,
  onSave,
  searchBibliography,
  disabled,
}: Props): JSX.Element {
  const handeManuscriptsChange = (manuscripts: Manuscript[]) =>
    onChange(
      produce(chapter, (draft) => {
        draft.manuscripts = castDraft(populateIds(manuscripts))
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
