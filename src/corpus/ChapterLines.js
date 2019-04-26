import React from 'react'
import { Form, Col } from 'react-bootstrap'
import _ from 'lodash'
import ListForm from 'common/List'
import Editor from 'editor/Editor'
import { createLine, createManuscriptLine } from './text'

function ManuscriptLineForm ({ value, manuscripts, onChange, disabled }) {
  const handleChange = property => event => onChange(value.set(property, event.target.value))
  return <Form.Row>
    <Form.Group as={Col} md={2} controlId={_.uniqueId('ManuscriptLine-')}>
      <Form.Label>Siglum</Form.Label>
      <Form.Control as='select' value={value.manuscriptId} onChange={handleChange('manuscriptId')}>
        {manuscripts.map(manuscript =>
          <option key={manuscript.id} value={manuscript.id}>
            {manuscript.provenance.abbreviation}
            {manuscript.period.abbreviation}
            {manuscript.type.abbreviation}
            {manuscript.siglumDisambiguator}
          </option>
        )}
      </Form.Control>
    </Form.Group>
    <Form.Group as={Col} md={1} controlId={_.uniqueId('ManuscriptLine-')}>
      <Form.Label>Side</Form.Label>
      <Form.Control value={value.side} onChange={handleChange('side')} />
    </Form.Group>
    <Form.Group as={Col} md={1} controlId={_.uniqueId('ManuscriptLine-')}>
      <Form.Label>Line nr.</Form.Label>
      <Form.Control value={value.number} onChange={handleChange('number')} />
    </Form.Group>
    <Col>
      <label>Text</label>
      <Editor name={_.uniqueId('Text-')} value={value.atf} onChange={atf => onChange(value.set('atf', atf))} disabled={disabled} />
    </Col>
  </Form.Row>
}

function ManuscriptLines ({ lines, manuscripts, onChange, disabled }) {
  return <ListForm noun='manuscript' default={createManuscriptLine()} value={lines} onChange={onChange}>
    {lines.map((line, index) => <ManuscriptLineForm key={index} value={line} manuscripts={manuscripts} disabled={disabled} />)}
  </ListForm>
}

function ChapterLineForm ({ value, manuscripts, onChange, disabled }) {
  const handleChangeValue = property => propertyValue => onChange(value.set(property, propertyValue))
  const handleChange = property => event => onChange(value.set(property, event.target.value))
  return <>
    <Form.Row>
      <Form.Group as={Col} md={1} controlId={_.uniqueId('Lines-')}>
        <Form.Label>Number</Form.Label>
        <Form.Control value={value.number} onChange={handleChange('number')} />
      </Form.Group>
      <Col>
        <label>Ideal reconstruction</label>
        <Editor name={_.uniqueId('IdealReconstruction-')} value={value.reconstruction} onChange={handleChangeValue('reconstruction')} disabled={disabled} />
      </Col>
    </Form.Row>
    <ManuscriptLines lines={value.manuscripts} manuscripts={manuscripts} onChange={handleChangeValue('manuscripts')} disabled={disabled} />
  </>
}

export default function ChapterLines ({ chapter, onChange, disabled }) {
  const handleChange = lines => onChange(chapter.set('lines', lines))
  return <ListForm noun='line' default={createLine()} value={chapter.lines} onChange={handleChange}>
    {chapter.lines.map((line, index) => <ChapterLineForm key={index} value={line} manuscripts={chapter.manuscripts} disabled={disabled} />)}
  </ListForm>
}
