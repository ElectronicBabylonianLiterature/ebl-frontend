import React from 'react'
import { Form, Button, Col } from 'react-bootstrap'
import _ from 'lodash'
import ListForm from 'common/List'
import { Manuscript } from './text'
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

function ChapterManuscripts ({ chapter, onChange, searchBibliography }) {
  const handeManuscriptsChange = manuscripts => onChange(chapter.set('manuscripts', manuscripts))
  return <ListForm label='Manuscripts' noun='manuscript' default={Manuscript()} value={chapter.manuscripts} onChange={handeManuscriptsChange}>
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
