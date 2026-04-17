import React from 'react'
import { Form, Col, Row } from 'react-bootstrap'
import _ from 'lodash'
import { Chapter } from 'corpus/domain/chapter'

export default function ChapterDetails({
  chapter,
}: {
  chapter: Chapter
}): JSX.Element {
  return (
    <Form className="chapter-details">
      <Row className="chapter-details__row">
        <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
          <Form.Label className="chapter-details__label">
            Classification
          </Form.Label>
          <Form.Control
            plaintext
            readOnly
            value={chapter.classification}
            className="chapter-details__value"
          />
        </Form.Group>
        <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
          <Form.Label className="chapter-details__label">Stage</Form.Label>
          <Form.Control
            plaintext
            readOnly
            value={chapter.stage}
            className="chapter-details__value"
          />
        </Form.Group>
        <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
          <Form.Label className="chapter-details__label">Version</Form.Label>
          <Form.Control
            plaintext
            readOnly
            value={chapter.version}
            className="chapter-details__value"
          />
        </Form.Group>
        <Form.Group as={Col} controlId={_.uniqueId('ChapterView-')}>
          <Form.Label className="chapter-details__label">Name</Form.Label>
          <Form.Control
            plaintext
            readOnly
            value={chapter.name}
            className="chapter-details__value"
          />
        </Form.Group>
      </Row>
    </Form>
  )
}
