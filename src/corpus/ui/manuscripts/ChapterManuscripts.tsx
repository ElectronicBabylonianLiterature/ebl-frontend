import _ from 'lodash'
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
  const handleUncertainFragmentsChange = (uncertainFragments: string[]) => {
    onChange(
      produce(chapter, (draft) => {
        draft.uncertainFragments = uncertainFragments
      })
    )
  }
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
          label="Manuscripts"
          noun="manuscript"
          defaultValue={createManuscript({})}
          value={chapter.manuscripts}
          onChange={handeManuscriptsChange}
        >
          {(manuscript: Manuscript, onChange) => (
            <ManuscriptForm
              onChange={onChange}
              manuscript={manuscript}
              searchBibliography={searchBibliography}
            />
          )}
        </ListForm>
        <ListForm
          label="Uncertain Fragments"
          noun="fragment"
          defaultValue=""
          value={chapter.uncertainFragments}
          onChange={handleUncertainFragmentsChange}
          collapsed
        >
          {(fragment: string, onChange) => (
            <Form.Group controlId={_.uniqueId('uncertainFragment-')}>
              <Form.Label>Museum Number</Form.Label>
              <Form.Control
                value={fragment}
                onChange={(event) => onChange(event.target.value)}
              />
            </Form.Group>
          )}
        </ListForm>
        <Button onClick={onSave}>Save manuscripts</Button>
      </fieldset>
    </Form>
  )
}
