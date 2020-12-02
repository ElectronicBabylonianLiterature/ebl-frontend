import React, { useState } from 'react'
import { Chapter, Line, ManuscriptLine } from 'corpus/domain/text'
import { Badge, Button, Col, Form } from 'react-bootstrap'
import WordAligner from './WordAligner'
import produce, { castDraft, Draft } from 'immer'
import Reconstruction from '../Reconstruction'
import { Token } from 'transliteration/domain/token'
import { Alignment, AlignmentToken } from 'corpus/domain/alignment'

function ManuscriptAlignment(props: {
  chapter: Chapter
  line: Line
  manuscriptLine: ManuscriptLine
  alignment: readonly AlignmentToken[]
  onChange: (alignment: readonly AlignmentToken[]) => void
}) {
  const handleChange = (index: number) => (token: Token) => {
    props.onChange(
      produce(props.alignment, (draft: Draft<AlignmentToken[]>) => {
        draft[index] = castDraft(token)
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
  onSave,
  disabled,
}: {
  chapter: Chapter
  onSave: (alignment: Alignment) => void
  disabled: boolean
}): JSX.Element {
  const [alignment, setAlignment] = useState(chapter.alignment)
  const handleChange = (lineIndex: number) => (manuscriptIndex: number) => (
    manuscriptAlignment: readonly AlignmentToken[]
  ) =>
    setAlignment(
      produce(alignment, (draft: Draft<Alignment>) => {
        draft[lineIndex][manuscriptIndex] = castDraft(manuscriptAlignment)
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
                alignment={alignment[lineIndex][manuscriptIndex]}
                onChange={handleChange(lineIndex)(manuscriptIndex)}
              />
            ))}
          </section>
        ))}
        <Button onClick={() => onSave(alignment)}>Save alignment</Button>
      </fieldset>
    </Form>
  )
}
