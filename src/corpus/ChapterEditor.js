import React from 'react'
import { Form, Col, Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'
import ChapterManuscripts from './manuscripts/ChapterManuscripts'
import ChapterLines from './lines/ChapterLines'
import ChapterAlignment from 'corpus/alignment/ChapterAlignment'
import SessionContext from 'auth/SessionContext'

function ChapterDetails({ chapter }) {
  return (
    <Form>
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
    </Form>
  )
}

export default function ChapterEditor({
  onSaveLines,
  onSaveManuscripts,
  onSaveAlignment,
  disabled,
  chapter,
  searchBibliography,
  onChange
}) {
  return (
    <SessionContext.Consumer>
      {session => (
        <>
          <ChapterDetails chapter={chapter} />
          <Tabs
            defaultActiveKey="manuscripts"
            id={_.uniqueId('ChapterFormTabs-')}
            mountOnEnter
            unmountOnExit
          >
            <Tab eventKey="manuscripts" title="Manuscripts">
              <ChapterManuscripts
                chapter={chapter}
                searchBibliography={searchBibliography}
                onChange={onChange}
                onSave={onSaveManuscripts}
                disabled={disabled}
              />
            </Tab>
            <Tab eventKey="lines" title="Lines">
              <ChapterLines
                chapter={chapter}
                onChange={onChange}
                onSave={onSaveLines}
                disabled={disabled}
              />
            </Tab>
            <Tab
              eventKey="alignment"
              title="Alignment"
              disabled={!session.hasBetaAccess()}
            >
              <ChapterAlignment
                chapter={chapter}
                onChange={onChange}
                onSave={onSaveAlignment}
                disabled={disabled}
              />
            </Tab>
          </Tabs>
        </>
      )}
    </SessionContext.Consumer>
  )
}
