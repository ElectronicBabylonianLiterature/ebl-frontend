import React, { useState } from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import {
  AlignmentToken,
  ChapterAlignment,
  ManuscriptAlignment,
  setAlignmentToken,
  setOmittedWords,
} from 'corpus/domain/alignment'
import { LineVariant, ManuscriptLine } from 'corpus/domain/line'
import { Chapter } from 'corpus/domain/chapter'
import Reconstruction from 'corpus/ui/Reconstruction'
import ManuscriptWordAligners from 'corpus/ui/alignment/ManuscriptWordAligners'
import OmittedWordsSelect from 'corpus/ui/alignment/OmittedWordsSelect'

function ManuscriptAligner(props: {
  chapter: Chapter
  line: LineVariant
  manuscriptLine: ManuscriptLine
  alignment: ManuscriptAlignment
  onChange: (alignment: ManuscriptAlignment) => void
}) {
  const handleChange = (index: number, token: AlignmentToken) => {
    props.onChange(setAlignmentToken(props.alignment, index, token))
  }

  const handleOmittedChange = (value: number[]) => {
    props.onChange(setOmittedWords(props.alignment, value))
  }

  return (
    <Row>
      <Col md={1}>{props.chapter.getSiglum(props.manuscriptLine)}</Col>
      <Col md={1}>
        {props.manuscriptLine.labels} {props.manuscriptLine.number}
      </Col>
      <Col md={7}>
        <ManuscriptWordAligners
          manuscriptLine={props.manuscriptLine}
          alignment={props.alignment}
          reconstructionTokens={props.line.reconstructionTokens}
          onChange={handleChange}
        />
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
  const handleChange =
    (lineIndex: number, variantIndex: number, manuscriptIndex: number) =>
    (manuscriptAlignment: ManuscriptAlignment) =>
      setAlignment(
        alignment.setAlignment(
          lineIndex,
          variantIndex,
          manuscriptIndex,
          manuscriptAlignment,
        ),
      )

  return (
    <Container>
      {chapter.lines.map((line, lineIndex) => (
        <Row key={lineIndex}>
          <Col md={1}>{line.number}</Col>
          <Col md={11}>
            {line.variants.map((variant, variantIndex) => (
              <div key={variantIndex}>
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
                      manuscriptIndex,
                    )}
                    onChange={handleChange(
                      lineIndex,
                      variantIndex,
                      manuscriptIndex,
                    )}
                  />
                ))}
              </div>
            ))}
          </Col>
        </Row>
      ))}
      <Button onClick={() => onSave(alignment)} disabled={disabled}>
        Save alignment
      </Button>
    </Container>
  )
}
