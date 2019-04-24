import React from 'react'
import { Form, Button, Col } from 'react-bootstrap'
import _ from 'lodash'
import { Seq, Range } from 'immutable'
import ListForm from 'common/List'
import { createManuscript } from './text'
import ManuscriptForm from './ManuscriptForm'

function ChapterDetails ({ chapter }) {
  return (
    <Form.Row>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Classification</Form.Label>
        <Form.Control plaintext readOnly value={chapter.classification} />
      </Form.Group>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Stage</Form.Label>
        <Form.Control plaintext readOnly value={chapter.stage} />
      </Form.Group>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Version</Form.Label>
        <Form.Control plaintext readOnly value={chapter.version} />
      </Form.Group>
      <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
        <Form.Label>Name</Form.Label>
        <Form.Control plaintext readOnly value={chapter.name} />
      </Form.Group>
    </Form.Row>
  )
}

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

function ChapterManuscripts ({ chapter, onChange, searchBibliography }) {
  const handeManuscriptsChange = manuscripts => onChange(chapter.set('manuscripts', populateIds(manuscripts)))
  return <ListForm label='Manuscripts' noun='manuscript' default={createManuscript()} value={chapter.manuscripts} onChange={handeManuscriptsChange}>
    {chapter.manuscripts.map((manuscript, index) =>
      <ManuscriptForm key={index} manuscript={manuscript} searchBibliography={searchBibliography} />
    )}
  </ListForm>
}

export default function ChapterForm ({ onSubmit, disabled, chapter, searchBibliography, onChange }) {
  return <Form onSubmit={onSubmit}>
    <fieldset disabled={disabled}>
      <ChapterDetails chapter={chapter} />
      <ChapterManuscripts chapter={chapter} searchBibliography={searchBibliography} onChange={onChange} />
      <Button variant='primary' type='submit'>Save</Button>
    </fieldset>
  </Form>
}
