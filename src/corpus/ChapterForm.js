import React from 'react'
import { Form, Button, Col, Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'
import ChapterManuscripts from './ChapterManuscripts'
import ChapterLines from './ChapterLines'

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

export default function ChapterForm ({ onSubmit, disabled, chapter, searchBibliography, onChange }) {
  return <Form onSubmit={onSubmit}>
    <fieldset disabled={disabled}>
      <ChapterDetails chapter={chapter} />
      <Tabs defaultActiveKey='manuscripts' id={_.uniqueId('ChapterFormTabs-')}>
        <Tab eventKey='manuscripts' title='Manuscripts'>
          <ChapterManuscripts chapter={chapter} searchBibliography={searchBibliography} onChange={onChange} />
        </Tab>
        <Tab eventKey='lines' title='Lines'>
          <ChapterLines chapter={chapter} onChange={onChange} disabled={disabled} />
        </Tab>
      </Tabs>
      <Button variant='primary' type='submit'>Save</Button>
    </fieldset>
  </Form>
}
