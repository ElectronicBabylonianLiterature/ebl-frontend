import React from 'react'
import { Chapter, Line, ManuscriptLine, AtfToken } from 'corpus/domain/text'
import { Badge, Button, Col, Form } from 'react-bootstrap'
import WordAligner from './WordAligner'
import produce, { castDraft, Draft } from 'immer'
import Reconstruction from '../Reconstruction'

function ManuscriptAlignment(props: {
  chapter: Chapter
  line: Line
  manuscriptLine: ManuscriptLine
  onChange: (line: ManuscriptLine) => void
}) {
  const handleChange = (index: number) => (token: AtfToken) => {
    props.onChange(
      produce(props.manuscriptLine, (draft: Draft<ManuscriptLine>) => {
        draft.atfTokens[index] = castDraft(token)
      })
    )
  }
  return (
    <Form.Row>
      <Col md={1} />
      <Col md={1}>{props.chapter.getSiglum(props.manuscriptLine)}</Col>
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
  onChange: (chapter: Chapter) => void
  onSave: () => void
  disabled: boolean
}): JSX.Element {
  const handleChange = (lineIndex: number) => (manuscriptIndex: number) => (
    manuscript: ManuscriptLine
  ) =>
    onChange(
      produce(chapter, (draft: Draft<Chapter>) => {
        draft.lines[lineIndex].manuscripts[manuscriptIndex] = castDraft(
          manuscript
        )
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
