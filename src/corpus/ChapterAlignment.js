// @flow
import React from 'react'
import type { Chapter, Line, ManuscriptLine } from './text'
import { Badge, Col, Form, Button } from 'react-bootstrap'

function getSiglum(chapter: Chapter, manuscriptLine: ManuscriptLine) {
  const manuscript = chapter.manuscripts.find(
    candidate => candidate.id === manuscriptLine.manuscriptId
  )
  if (manuscript) {
    return manuscript.siglum
  } else {
    return `<unknown ID: ${manuscriptLine.manuscriptId}>`
  }
}

function Reconstruction(props: { line: Line }) {
  return (
    <Form.Row>
      <Col md={3}>{props.line.number}</Col>
      <Col md={9}>{props.line.reconstruction}</Col>
    </Form.Row>
  )
}

function ManuscriptAlignment(props: {
  chapter: Chapter,
  manuscriptLine: ManuscriptLine
}) {
  return (
    <Form.Row>
      <Col md={1} />
      <Col md={1}>{getSiglum(props.chapter, props.manuscriptLine)}</Col>
      <Col md={1}>
        {props.manuscriptLine.labels} {props.manuscriptLine.number}
      </Col>
      <Col md={9}>
        {props.manuscriptLine.atfTokens.map((token, index) =>
          token.lemmatizable ? (
            <span key={index}>
              <Button size="sm" variant="outline-dark">
                {token.value}
              </Button>{' '}
            </span>
          ) : (
            <span key={index}>{token.value} </span>
          )
        )}
      </Col>
    </Form.Row>
  )
}

export default function ChapterAlignment({ chapter }: { chapter: Chapter }) {
  return (
    <>
      <Badge variant="danger">WIP</Badge>
      {chapter.lines.map((line, index) => (
        <section key={index}>
          <Reconstruction line={line} />
          {line.manuscripts.map((manuscript, index) => (
            <ManuscriptAlignment
              key={index}
              chapter={chapter}
              manuscriptLine={manuscript}
            />
          ))}
        </section>
      ))}
    </>
  )
}
