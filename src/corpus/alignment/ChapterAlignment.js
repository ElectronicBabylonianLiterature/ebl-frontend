// @flow
import React from 'react'
import type { Chapter, Line, ManuscriptLine } from '../text'
import { Alert, Badge, Button, Col, Form } from 'react-bootstrap'
import WordAligner from './WordAligner'
// $FlowFixMe
import { Draft, produce } from 'immer'

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
  line: Line,
  manuscriptLine: ManuscriptLine,
  onChange: ManuscriptLine => void
}) {
  const handleChange = index => token => {
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
        {props.manuscriptLine.atfTokens.map((token, index) =>
          token.lemmatizable ? (
            <span key={index}>
              <WordAligner
                token={token}
                reconstructionTokens={props.line.reconstructionTokens}
                onChange={handleChange(index)}
              />{' '}
            </span>
          ) : (
            <span key={index}>{token.value} </span>
          )
        )}
      </Col>
    </Form.Row>
  )
}

export default function ChapterAlignment({
  chapter,
  onChange,
  onSave,
  disabled
}: {
  chapter: Chapter,
  onChange: Chapter => void,
  onSave: void => void,
  disabled: boolean
}) {
  const handleChange = lineIndex => manuscriptIndex => manuscript =>
    onChange(
      produce(chapter, (draft: Draft<Chapter>) => {
        draft.lines[lineIndex].manuscripts[manuscriptIndex] = manuscript
      })
    )
  return (
    <Form>
      <fieldset disabled={disabled}>
        <Badge variant="warning">Beta</Badge>
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
