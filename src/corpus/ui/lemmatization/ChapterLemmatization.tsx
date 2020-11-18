import React, { useState, Fragment } from 'react'
import { Chapter, Line, ManuscriptLine } from 'corpus/domain/text'
import { Badge, Button, Col, Container, Row } from 'react-bootstrap'
import Promise from 'bluebird'
import produce, { castDraft, Draft } from 'immer'
import WordLemmatizer from 'fragmentarium/ui/lemmatization/WordLemmatizer'
import {
  UniqueLemma,
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import FragmentService from 'fragmentarium/application/FragmentService'
import Lemma from 'transliteration/domain/Lemma'
import Word from 'dictionary/domain/Word'
import WordService from 'dictionary/application/WordService'
import withData, { WithoutData } from 'http/withData'
import { Token } from 'transliteration/domain/token'

function findSuggestions(
  fragmentService: FragmentService,
  wordService: WordService,
  tokens: readonly Token[]
): Promise<LemmatizationToken[]> {
  return Promise.mapSeries(tokens, (token) =>
    fragmentService
      .findSuggestions(token.cleanValue, token.normalized ?? false)
      .then((suggestions) =>
        Promise.all(
          token.uniqueLemma?.map((value) =>
            wordService.find(value).then((word: Word) => new Lemma(word))
          ) ?? []
        ).then(
          (lemmas) =>
            new LemmatizationToken(
              token.value,
              token.lemmatizable ?? false,
              lemmas,
              suggestions
            )
        )
      )
  )
}

function setLemmatizationToken(
  lemmatization: readonly LemmatizationToken[],
  index: number,
  newToken: LemmatizationToken
): readonly LemmatizationToken[] {
  return produce(lemmatization, (draft) => {
    draft[index] = castDraft(newToken)
  })
}

function setReconstructionLemma(
  line: Line,
  index: number,
  uniqueLemma: UniqueLemma
): Line {
  return produce(line, (draft: Draft<Line>) => {
    draft.reconstructionTokens[index].uniqueLemma = uniqueLemma.map(
      (lemma) => lemma.value
    )
  })
}

interface RecontsructionLemmatizationProps {
  data: readonly LemmatizationToken[]
  fragmentService: FragmentService
  chapter: Chapter
  line: Line
  onChange: (index: number) => (uniqueLemma: UniqueLemma) => void
}

function ReconstructionLemmatization(props: RecontsructionLemmatizationProps) {
  return (
    <Row>
      <Col md={3}>{props.line.number}</Col>
      <Col md={9}>
        {props.data.map((token, index) => (
          <Fragment key={index}>
            {token.lemmatizable ? (
              <WordLemmatizer
                fragmentService={props.fragmentService}
                token={token}
                onChange={props.onChange(index)}
              />
            ) : (
              token.value
            )}{' '}
          </Fragment>
        ))}
      </Col>
    </Row>
  )
}

interface ManuscriptLineLemmatizationProps {
  data: readonly LemmatizationToken[]
  fragmentService: FragmentService
  chapter: Chapter
  manuscriptLine: ManuscriptLine
  onChange: (index: number) => (uniqueLemma: UniqueLemma) => void
}

function ManuscriptLineLemmatization(props: ManuscriptLineLemmatizationProps) {
  return (
    <Row>
      <Col md={1} />
      <Col md={1}>{props.chapter.getSiglum(props.manuscriptLine)}</Col>
      <Col md={1}>
        {props.manuscriptLine.labels} {props.manuscriptLine.number}
      </Col>
      <Col md={9}>
        {props.data.map((token, index) => (
          <Fragment key={index}>
            {token.lemmatizable ? (
              <WordLemmatizer
                fragmentService={props.fragmentService}
                token={token}
                onChange={props.onChange(index)}
              />
            ) : (
              token.value
            )}{' '}
          </Fragment>
        ))}
      </Col>
    </Row>
  )
}

interface ManuscriptsLemmatizationProps {
  data: readonly LemmatizationToken[][]
  fragmentService: FragmentService
  chapter: Chapter
  manuscripts: readonly ManuscriptLine[]
  onChange: (
    manuscriptIndex: number
  ) => (index: number) => (uniqueLemma: UniqueLemma) => void
}

function ManuscriptsLemmatization({
  data,
  fragmentService,
  chapter,
  manuscripts,
  onChange,
}: ManuscriptsLemmatizationProps): JSX.Element {
  return (
    <>
      {manuscripts.map(
        (manuscript: ManuscriptLine, manuscriptIndex: number) => (
          <ManuscriptLineLemmatization
            key={manuscriptIndex}
            fragmentService={fragmentService}
            chapter={chapter}
            manuscriptLine={manuscript}
            data={data[manuscriptIndex]}
            onChange={onChange(manuscriptIndex)}
          />
        )
      )}
    </>
  )
}

interface LinesLemmatizationProps {
  data: [readonly LemmatizationToken[], readonly LemmatizationToken[][]]
  fragmentService: FragmentService
  chapter: Chapter
  line: Line
  onChange: (line: Line) => void
}

function LinesLemmatization({
  data,
  fragmentService,
  chapter,
  line,
  onChange,
}: LinesLemmatizationProps) {
  const [
    reconstructionLemmatization,
    setReconstructionLemmatization,
  ] = useState(data[0])
  const [manuscriptsLemmatization, setManuscriptsLemmatization] = useState(
    data[1]
  )
  const handleReconstructionChange = (index: number) => (
    uniqueLemma: UniqueLemma
  ) => {
    setReconstructionLemmatization(
      produce(reconstructionLemmatization, (draft) => {
        draft[index] = castDraft(draft[index].setUniqueLemma(uniqueLemma))
      })
    )
    onChange(setReconstructionLemma(line, index, uniqueLemma))
  }
  const handleManuscriptChange = (manuscriptIndex: number) => (
    index: number
  ) => (uniqueLemma: UniqueLemma) => {
    setManuscriptsLemmatization(
      produce(manuscriptsLemmatization, (draft) => {
        draft[manuscriptIndex][index] = castDraft(
          draft[manuscriptIndex][index].setUniqueLemma(uniqueLemma)
        )
      })
    )
    onChange(
      produce(line, (draft: Draft<Line>) => {
        draft.manuscripts[manuscriptIndex].atfTokens[
          index
        ].uniqueLemma = uniqueLemma.map((lemma) => lemma.value)
      })
    )
  }
  return (
    <>
      <ReconstructionLemmatization
        data={reconstructionLemmatization}
        line={line}
        fragmentService={fragmentService}
        chapter={chapter}
        onChange={handleReconstructionChange}
      />
      <ManuscriptsLemmatization
        data={manuscriptsLemmatization}
        fragmentService={fragmentService}
        manuscripts={line.manuscripts}
        chapter={chapter}
        onChange={handleManuscriptChange}
      />
    </>
  )
}

const LinesLemmatizationWithData = withData<
  WithoutData<LinesLemmatizationProps>,
  { wordService: WordService },
  [readonly LemmatizationToken[], readonly LemmatizationToken[][]]
>(LinesLemmatization, (props) =>
  Promise.all([
    findSuggestions(
      props.fragmentService,
      props.wordService,
      props.line.reconstructionTokens
    ),
    Promise.mapSeries(props.line.manuscripts, (manuscript) =>
      findSuggestions(
        props.fragmentService,
        props.wordService,
        manuscript.atfTokens
      )
    ),
  ])
)

export default function ChapterLemmatization({
  fragmentService,
  wordService,
  chapter,
  onChange,
  onSave,
  disabled,
}: {
  fragmentService: FragmentService
  wordService: WordService
  chapter: Chapter
  onChange: (chapter: Chapter) => void
  onSave: () => void
  disabled: boolean
}): JSX.Element {
  const handleChange = (lineIndex: number) => (line: Line) =>
    onChange(
      produce(chapter, (draft: Draft<Chapter>) => {
        draft.lines[lineIndex] = castDraft(line)
      })
    )
  return (
    <Container>
      <Badge variant="warning">Beta</Badge>
      {chapter.lines.map((line, lineIndex) => (
        <LinesLemmatizationWithData
          key={lineIndex}
          line={line}
          fragmentService={fragmentService}
          wordService={wordService}
          chapter={chapter}
          onChange={handleChange(lineIndex)}
        />
      ))}
      <Button onClick={() => onSave()} disabled={disabled}>
        Save lemmatization
      </Button>
    </Container>
  )
}
