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
    <Form>
      <Row>
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
      </Row>
    </Form>
  )
}
