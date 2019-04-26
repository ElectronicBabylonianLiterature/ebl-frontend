import React from 'react'
import { Form, Col } from 'react-bootstrap'
import _ from 'lodash'
import ListForm from 'common/List'
import Editor from 'editor/Editor'
import { createLine } from './text'

function LineForm ({ value, onChange, disabled }) {
  const handleChange = property => event => onChange(value.set(property, event.target.value))
  return <Form.Row>
    <Form.Group as={Col} md={1} controlId={_.uniqueId('Lines-')}>
      <Form.Label>Number</Form.Label>
      <Form.Control value={value.number} onChange={handleChange('number')} />
    </Form.Group>
    <Col>
      <label>Ideal reconstruction</label>
      <Editor name={_.uniqueId('IdealReconstruction-')} value={value.reconstruction} onChange={reconstruction => onChange(value.set('reconstruction', reconstruction))} disabled={disabled} />
    </Col>
  </Form.Row>
}

export default function ChapterLines ({ chapter, onChange, disabled }) {
  const handleChange = lines => onChange(chapter.set('lines', lines))
  return <ListForm noun='line' default={createLine()} value={chapter.lines} onChange={handleChange}>
    {chapter.lines.map((line, index) => <LineForm key={index} value={line} disabled={disabled} />)}
  </ListForm>
}
