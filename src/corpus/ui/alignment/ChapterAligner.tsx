import React, { useState } from 'react'
import { Chapter, Line, ManuscriptLine } from 'corpus/domain/text'
import { Badge, Button, Col, Container, Row } from 'react-bootstrap'
import WordAligner from './WordAligner'
import produce, { castDraft, Draft } from 'immer'
import Reconstruction from 'corpus/ui/Reconstruction'
import { ChapterAlignment, AlignmentToken } from 'corpus/domain/alignment'

function ManuscriptAligner(props: {
  chapter: Chapter
  line: Line
  manuscriptLine: ManuscriptLine
  alignment: readonly AlignmentToken[]
  onChange: (alignment: readonly AlignmentToken[]) => void
}) {
  const handleChange = (index: number) => (token: AlignmentToken) => {
    props.onChange(
      produce(props.alignment, (draft: Draft<AlignmentToken[]>) => {
        draft[index] = castDraft(token)
      })
    )
  }
  return (
    <Row>
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
                token={props.alignment[index]}
                reconstructionTokens={props.line.reconstructionTokens}
                onChange={handleChange(index)}
              />
            ) : (
              token.value
            )}{' '}
          </span>
        ))}
      </Col>
    </Row>
  )
}

export default function ChapterAligner({
  chapter,
  onSave,
  disabled,
}: {
  chapter: Chapter
  onSave: (alignment: ChapterAlignment) => void
  disabled: boolean
}): JSX.Element {
  const [alignment, setAlignment] = useState(chapter.alignment)
  const handleChange = (lineIndex: number) => (manuscriptIndex: number) => (
    manuscriptAlignment: readonly AlignmentToken[]
  ) =>
    setAlignment(
      produce(alignment, (draft: Draft<ChapterAlignment>) => {
        draft[lineIndex][manuscriptIndex] = castDraft(manuscriptAlignment)
      })
    )
  return (
    <Container>
      <Badge variant="warning">Beta</Badge>
      {chapter.lines.map((line, lineIndex) => (
        <section key={lineIndex}>
          <Reconstruction line={line} />
          {line.manuscripts.map((manuscript, manuscriptIndex) => (
            <ManuscriptAligner
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
      <Button onClick={() => onSave(alignment)} disabled={disabled}>
        Save alignment
      </Button>
    </Container>
  )
}
