import React, { useState } from 'react'
import _ from 'lodash'
import { LineVariant } from 'corpus/domain/line'
import { Chapter } from 'corpus/domain/chapter'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { produce, castDraft } from 'immer'
import { UniqueLemma } from 'transliteration/domain/Lemmatization'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData, { WithoutData } from 'http/withData'
import TextService from 'corpus/application/TextService'
import {
  ChapterLemmatization,
  LineLemmatization,
} from 'corpus/domain/lemmatization'
import {
  ManuscriptsLemmatizer,
  ReconstructionLemmatizer,
} from 'corpus/ui/lemmatization/LineLemmatizers'

interface ChapterLineLemmatizerProps {
  data: LineLemmatization
  fragmentService: FragmentService
  chapter: Chapter
  line: LineVariant
  onChange: (lemmatization: LineLemmatization) => void
}

function LineVariantLemmatizater({
  data,
  fragmentService,
  chapter,
  line,
  onChange,
}: ChapterLineLemmatizerProps): JSX.Element {
  const [reconstructionLemmatization, manuscriptsLemmatization] = data

  const handleReconstructionChange =
    (index: number) => (uniqueLemma: UniqueLemma) =>
      onChange([
        produce(reconstructionLemmatization, (draft) => {
          draft[index] = castDraft(draft[index].setUniqueLemma(uniqueLemma))
        }),
        produce(manuscriptsLemmatization, (draft) => {
          return draft.map((manuscript, manuscriptIndex) =>
            manuscript.map((lemmatizationToken, tokenIndex) => {
              const token =
                line.manuscripts[manuscriptIndex].atfTokens[tokenIndex]
              return token.lemmatizable &&
                token.alignment === index &&
                (_.isEmpty(lemmatizationToken.uniqueLemma) ||
                  lemmatizationToken.suggested)
                ? castDraft(
                    lemmatizationToken.setUniqueLemma(uniqueLemma, true),
                  )
                : lemmatizationToken
            }),
          )
        }),
      ])

  const handleManuscriptChange =
    (manuscriptIndex: number) =>
    (index: number) =>
    (uniqueLemma: UniqueLemma) =>
      onChange([
        reconstructionLemmatization,
        produce(manuscriptsLemmatization, (draft) => {
          draft[manuscriptIndex][index] = castDraft(
            draft[manuscriptIndex][index].setUniqueLemma(uniqueLemma),
          )
        }),
      ])

  return (
    <>
      <ReconstructionLemmatizer
        data={reconstructionLemmatization}
        line={line}
        fragmentService={fragmentService}
        chapter={chapter}
        onChange={handleReconstructionChange}
      />
      <ManuscriptsLemmatizer
        data={manuscriptsLemmatization}
        fragmentService={fragmentService}
        manuscripts={line.manuscripts}
        chapter={chapter}
        onChange={handleManuscriptChange}
      />
    </>
  )
}

interface ChapterLemmatizerProps {
  fragmentService: FragmentService
  chapter: Chapter
  data: ChapterLemmatization
  onSave: (lemmatization: ChapterLemmatization) => void
  disabled: boolean
}

function ChapterLemmatizer({
  fragmentService,
  chapter,
  data,
  onSave,
  disabled,
}: ChapterLemmatizerProps): JSX.Element {
  const [chapterLemmatization, setChapterLemmatization] = useState(data)
  const handleChange =
    (lineIndex: number, variantIndex: number) =>
    (lemmatization: LineLemmatization) =>
      setChapterLemmatization(
        produce(chapterLemmatization, (draft) => {
          draft[lineIndex][variantIndex] = castDraft(lemmatization)
        }),
      )
  return (
    <Container>
      {chapter.lines.map((line, lineIndex) => (
        <Row key={lineIndex}>
          <Col md={1}>{line.number}</Col>
          <Col md={11}>
            {line.variants.map((variant, variantIndex) => (
              <LineVariantLemmatizater
                key={variantIndex}
                line={variant}
                data={chapterLemmatization[lineIndex][variantIndex]}
                fragmentService={fragmentService}
                chapter={chapter}
                onChange={handleChange(lineIndex, variantIndex)}
              />
            ))}
          </Col>
        </Row>
      ))}
      <Button onClick={() => onSave(chapterLemmatization)} disabled={disabled}>
        Save lemmatization
      </Button>
    </Container>
  )
}

const ChapterLemmatizerWithData = withData<
  WithoutData<ChapterLemmatizerProps>,
  { textService: TextService },
  ChapterLemmatization
>(
  ChapterLemmatizer,
  (props) => props.textService.findSuggestions(props.chapter),
  {
    watch: (props) => [props.chapter.lines],
  },
)

export default ChapterLemmatizerWithData
