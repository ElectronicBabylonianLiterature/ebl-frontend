import React, { useState } from 'react'
import _ from 'lodash'
import { Chapter, Line, ManuscriptLine } from 'corpus/domain/text'
import { Badge, Button, Col, Container, Row } from 'react-bootstrap'
import Select, { OptionsType, ValueType } from 'react-select'
import WordAligner from './WordAligner'
import produce, { castDraft, Draft } from 'immer'
import Reconstruction from 'corpus/ui/Reconstruction'
import {
  ChapterAlignment,
  AlignmentToken,
  ManuscriptAlignment,
} from 'corpus/domain/alignment'
import { isAnyWord } from 'transliteration/domain/type-guards'
import { Token } from 'transliteration/domain/token'

interface OmittedWordOption {
  value: number
  label: string
}

const setAlignment = produce(
  (draft: Draft<ManuscriptAlignment>, index: number, token: AlignmentToken) => {
    draft.alignment[index] = castDraft(token)
  }
)

const setOmittedWords = produce(
  (draft: Draft<ManuscriptAlignment>, value: ValueType<OmittedWordOption>) => {
    draft.omittedWords = _.isArray(value)
      ? value.map((option) => option.value)
      : []
  }
)

function createOmittedWordOptions(
  reconstructionTokens: readonly Token[]
): OptionsType<OmittedWordOption> {
  return _(reconstructionTokens)
    .map((reconstructionToken, index) =>
      isAnyWord(reconstructionToken)
        ? {
            value: index,
            label: reconstructionToken.value,
          }
        : null
    )
    .reject(_.isNull)
    .value() as OmittedWordOption[]
}

function ManuscriptAligner(props: {
  chapter: Chapter
  line: Line
  manuscriptLine: ManuscriptLine
  alignment: ManuscriptAlignment
  onChange: (alignment: ManuscriptAlignment) => void
}) {
  const handleChange = (index: number) => (token: AlignmentToken) => {
    props.onChange(setAlignment(props.alignment, index, token))
  }

  const handleOmittedChange = (value: ValueType<OmittedWordOption>) => {
    props.onChange(setOmittedWords(props.alignment, value))
  }

  const options: OptionsType<OmittedWordOption> = createOmittedWordOptions(
    props.line.reconstructionTokens
  )

  const omittedWordsLabel = 'Omitted words'

  return (
    <Row>
      <Col md={1} />
      <Col md={1}>{props.chapter.getSiglum(props.manuscriptLine)}</Col>
      <Col md={1}>
        {props.manuscriptLine.labels} {props.manuscriptLine.number}
      </Col>
      <Col md={6}>
        {props.manuscriptLine.atfTokens.map((token, index) => (
          <span key={index}>
            {token.lemmatizable ? (
              <WordAligner
                token={props.alignment.alignment[index]}
                reconstructionTokens={props.line.reconstructionTokens}
                onChange={handleChange(index)}
              />
            ) : (
              token.value
            )}{' '}
          </span>
        ))}
      </Col>
      <Col md={3}>
        <Select
          aria-label={omittedWordsLabel}
          placeholder={omittedWordsLabel}
          options={options}
          value={
            props.alignment.omittedWords
              .map((index) => options.find((option) => option.value === index))
              .filter((option) => option) as OmittedWordOption[]
          }
          isMulti
          onChange={handleOmittedChange}
        />
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
  const handleChange = (lineIndex: number, manuscriptIndex: number) => (
    manuscriptAlignment: ManuscriptAlignment
  ) =>
    setAlignment(
      alignment.setAlignment(lineIndex, manuscriptIndex, manuscriptAlignment)
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
              alignment={alignment.getAlignment(lineIndex, manuscriptIndex)}
              onChange={handleChange(lineIndex, manuscriptIndex)}
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
