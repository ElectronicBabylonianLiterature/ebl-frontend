import {
  AlignmentToken,
  ChapterAlignment,
  ManuscriptAlignment,
} from 'corpus/domain/alignment'
import { Chapter, ManuscriptLine, LineVariant } from 'corpus/domain/text'
import Reconstruction from 'corpus/ui/Reconstruction'
import produce, { castDraft, Draft } from 'immer'
import React, { useState } from 'react'
import { Badge, Button, Col, Container, Row } from 'react-bootstrap'
import OmittedWordsSelect from './OmittedWordsSelect'
import WordAligner from './WordAligner'

const setAlignment = produce(
  (draft: Draft<ManuscriptAlignment>, index: number, token: AlignmentToken) => {
    draft.alignment[index] = castDraft(token)
  }
)

const setOmittedWords = produce(
  (draft: Draft<ManuscriptAlignment>, value: number[]) => {
    draft.omittedWords = value
  }
)

function ManuscriptAligner(props: {
  chapter: Chapter
  line: LineVariant
  manuscriptLine: ManuscriptLine
  alignment: ManuscriptAlignment
  onChange: (alignment: ManuscriptAlignment) => void
}) {
  const handleChange = (index: number) => (token: AlignmentToken) => {
    props.onChange(setAlignment(props.alignment, index, token))
  }

  const handleOmittedChange = (value: number[]) => {
    props.onChange(setOmittedWords(props.alignment, value))
  }

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
        <OmittedWordsSelect
          label="Omitted words"
          value={props.alignment.omittedWords}
          reconstructionTokens={props.line.reconstructionTokens}
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
  const handleChange = (
    lineIndex: number,
    variantIndex: number,
    manuscriptIndex: number
  ) => (manuscriptAlignment: ManuscriptAlignment) =>
    setAlignment(
      alignment.setAlignment(
        lineIndex,
        variantIndex,
        manuscriptIndex,
        manuscriptAlignment
      )
    )

  return (
    <Container>
      <Badge variant="warning">Beta</Badge>
      {chapter.lines.map((line, lineIndex) => (
        <ol key={lineIndex}>
          {line.variants.map((variant, variantIndex) => (
            <li key={variantIndex}>
              <Reconstruction line={variant} />
              {variant.manuscripts.map((manuscript, manuscriptIndex) => (
                <ManuscriptAligner
                  key={manuscriptIndex}
                  chapter={chapter}
                  line={variant}
                  manuscriptLine={manuscript}
                  alignment={alignment.getAlignment(
                    lineIndex,
                    variantIndex,
                    manuscriptIndex
                  )}
                  onChange={handleChange(
                    lineIndex,
                    variantIndex,
                    manuscriptIndex
                  )}
                />
              ))}
            </li>
          ))}
        </ol>
      ))}
      <Button onClick={() => onSave(alignment)} disabled={disabled}>
        Save alignment
      </Button>
    </Container>
  )
}
