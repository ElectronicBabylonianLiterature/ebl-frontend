import React from 'react'
import { Chapter, Line, ManuscriptLine } from 'corpus/domain/text'
import { Badge, Button, Col, Form } from 'react-bootstrap'
import WordAligner from './WordAligner'
import produce, { Draft } from 'immer'

function getSiglum(chapter: Chapter, manuscriptLine: ManuscriptLine) {
  const manuscript = chapter.manuscripts.find(
    (candidate) => candidate.id === manuscriptLine.manuscriptId
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
  chapter: Chapter
  line: Line
  manuscriptLine: ManuscriptLine
  onChange: (x0: ManuscriptLine) => void
}) {
  const handleChange = (index) => (token) => {
    props.onChange(
      produce(props.manuscriptLine, (draft: Draft<ManuscriptLine>) => {
        draft.atfTokens[index] = token
      })
    )
  }
  return (
    <Form.Row>
      <Col md={1} />
      <Col md={1}>{getSiglum(props.chapter, props.manuscriptLine)}</Col>
      <Col md={1}>
        {props.manuscriptLine.labels} {props.manuscriptLine.number}
      </Col>
      <Col md={9}>
        {props.manuscriptLine.atfTokens.map((token, index) => (
          <span key={index}>
            {token.lemmatizable ? (
              <WordAligner
                token={token}
                reconstructionTokens={props.line.reconstructionTokens}
                onChange={handleChange(index)}
              />
            ) : (
              token.value
            )}{' '}
          </span>
        ))}
      </Col>
    </Form.Row>
  )
}

export default function ChapterAlignment({
  chapter,
  onChange,
  onSave,
  disabled,
}: {
  chapter: Chapter
  onChange: (x0: Chapter) => any
  onSave: (x0: any) => any
  disabled: boolean
}) {
  const handleChange = (lineIndex) => (manuscriptIndex) => (manuscript) =>
    onChange(
      produce(chapter, (draft: Draft<Chapter>) => {
        draft.lines[lineIndex].manuscripts[manuscriptIndex] = manuscript
      })
    )
  return (
    <Form>
      <Badge variant="warning">Beta</Badge>
      <fieldset disabled={disabled}>
        {chapter.lines.map((line, lineIndex) => (
          <section key={lineIndex}>
            <Reconstruction line={line} />
            {line.manuscripts.map((manuscript, manuscriptIndex) => (
              <ManuscriptAlignment
                key={manuscriptIndex}
                chapter={chapter}
                line={line}
                manuscriptLine={manuscript}
                onChange={handleChange(lineIndex)(manuscriptIndex)}
              />
            ))}
          </section>
        ))}
        <Button onClick={onSave}>Save alignment</Button>
      </fieldset>
    </Form>
  )
}
