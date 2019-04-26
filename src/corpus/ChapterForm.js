import React from 'react'
import { Form, Button, Col, Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'
import ListForm from 'common/List'
import ChapterManuscripts from './ChapterManuscripts'
import Editor from 'editor/Editor'
import { createLine } from './text'

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

function LineForm ({ value, onChange, disabled }) {
  const handleChange = property => event => onChange(value.set(property, event.target.value))
  return <Form.Row>
    <Form.Group as={Col} md={1} controlId={_.uniqueId('Lines-')}>
      <Form.Label>Number</Form.Label>
      <Form.Control value={value.number} onChange={handleChange('number')} />
    </Form.Group>
    <Col>
      <label>Ideal reconstruction</label>
      <Editor
        name={_.uniqueId('IdealReconstruction-')}
        value={value.reconstruction}
        onChange={reconstruction => onChange(value.set('reconstruction', reconstruction))}
        disabled={disabled}
      />
    </Col>
  </Form.Row>
}

function Lines ({ chapter, onChange, disabled }) {
  const handleChange = lines => onChange(chapter.set('lines', lines))
  return <ListForm noun='line' default={createLine()} value={chapter.lines} onChange={handleChange}>
    {chapter.lines.map((line, index) => <LineForm key={index} value={line} disabled={disabled} />)}
  </ListForm>
}

export default function ChapterForm ({ onSubmit, disabled, chapter, searchBibliography, onChange }) {
  return <Form onSubmit={onSubmit}>
    <fieldset disabled={disabled}>
      <ChapterDetails chapter={chapter} />
      <Tabs defaultActiveKey='manuscripts' id={_.uniqueId('ChapterFormTabs-')}>
        <Tab eventKey='manuscripts' title='Manuscripts'>
          <ChapterManuscripts chapter={chapter} searchBibliography={searchBibliography} onChange={onChange} />
        </Tab>
        <Tab eventKey='lines' title='Lines'>
          <Lines chapter={chapter} onChange={onChange} disabled={disabled} />
        </Tab>
      </Tabs>
      <Button variant='primary' type='submit'>Save</Button>
    </fieldset>
  </Form>
}
