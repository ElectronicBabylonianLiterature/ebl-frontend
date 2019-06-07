// @flow
import React from 'react'
import type { Chapter, ManuscriptLine } from './text'
import { Badge, Col, Form } from 'react-bootstrap'

type Props = { chapter: Chapter }

function getSiglum (chapter: Chapter, manuscriptLine: ManuscriptLine) {
  const manuscript = chapter.manuscripts.find(
    candidate => candidate.id === manuscriptLine.manuscriptId
  )
  if (manuscript) {
    return manuscript.siglum
  } else {
    throw new Error(`Unknown manuscript ID ${manuscriptLine.manuscriptId}.`)
  }
}

export default function ChapterAlignment ({ chapter }: Props) {
  return (
    <>
      <Badge variant='danger'>WIP</Badge>
      {chapter.lines.map((line, index) => (
        <section key={index}>
          <Form.Row>
            <Col md={3}>{line.number}</Col>
            <Col md={9}>{line.reconstruction}</Col>
          </Form.Row>
          {line.manuscripts.map((manuscript, index) => (
            <Form.Row key={index}>
              <Col md={1} />
              <Col md={1}>{getSiglum(chapter, manuscript)}</Col>
              <Col md={1}>
                {manuscript.labels} {manuscript.number}
              </Col>
              <Col md={9}>{manuscript.atf}</Col>
            </Form.Row>
          ))}
        </section>
      ))}
    </>
  )
}
