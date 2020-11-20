import React, { useState, Fragment } from 'react'
import _ from 'lodash'
import { Chapter, Line, ManuscriptLine } from 'corpus/domain/text'
import { Badge, Button, Col, Container, Row } from 'react-bootstrap'
import Promise from 'bluebird'
import produce, { castDraft } from 'immer'
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

export type LineLemmatization = [
  readonly LemmatizationToken[],
  readonly LemmatizationToken[][]
]
export type ChapterLemmatization = readonly LineLemmatization[]

function findSuggestions(
  fragmentService: FragmentService,
  wordService: WordService,
  tokens: readonly Token[]
): Promise<LemmatizationToken[]> {
  return Promise.mapSeries(tokens, (token) =>
    fragmentService
      .findSuggestions(token.cleanValue, token.normalized ?? false)
      .then((suggestions) =>
        token.lemmatizable
          ? Promise.all(
              token.uniqueLemma?.map((value) =>
                wordService.find(value).then((word: Word) => new Lemma(word))
              ) ?? []
            ).then(
              (lemmas) =>
                new LemmatizationToken(
                  token.value,
                  token.lemmatizable,
                  lemmas,
                  suggestions
                )
            )
          : new LemmatizationToken(token.value, false)
      )
  )
}

interface LineLemmatizerProps<T> {
  data: readonly LemmatizationToken[]
  fragmentService: FragmentService
  chapter: Chapter
  line: T
  onChange: (index: number) => (uniqueLemma: UniqueLemma) => void
}

function WordLemmatizers({
  tokens,
  fragmentService,
  onChange,
}: {
  tokens: readonly LemmatizationToken[]
  fragmentService: FragmentService
  onChange: (index: number) => (uniqueLemma: UniqueLemma) => void
}): JSX.Element {
  return (
    <>
      {tokens.map((token, index) => (
        <Fragment key={index}>
          {token.lemmatizable ? (
            <WordLemmatizer
              fragmentService={fragmentService}
              token={token}
              onChange={onChange(index)}
            />
          ) : (
            token.value
          )}{' '}
        </Fragment>
      ))}
    </>
  )
}

function ReconstructionLemmatizer(props: LineLemmatizerProps<Line>) {
  return (
    <Row>
      <Col md={3}>{props.line.number}</Col>
      <Col md={9}>
        <WordLemmatizers
          tokens={props.data}
          onChange={props.onChange}
          fragmentService={props.fragmentService}
        />
      </Col>
    </Row>
  )
}

function ManuscriptLineLemmatizer(props: LineLemmatizerProps<ManuscriptLine>) {
  return (
    <Row>
      <Col md={1} />
      <Col md={1}>{props.chapter.getSiglum(props.line)}</Col>
      <Col md={1}>
        {props.line.labels} {props.line.number}
      </Col>
      <Col md={9}>
        <WordLemmatizers
          tokens={props.data}
          onChange={props.onChange}
          fragmentService={props.fragmentService}
        />
      </Col>
    </Row>
  )
}

interface ManuscriptsLemmatizerProps {
  data: readonly LemmatizationToken[][]
  fragmentService: FragmentService
  chapter: Chapter
  manuscripts: readonly ManuscriptLine[]
  onChange: (
    manuscriptIndex: number
  ) => (index: number) => (uniqueLemma: UniqueLemma) => void
}

function ManuscriptsLemmatizer({
  data,
  fragmentService,
  chapter,
  manuscripts,
  onChange,
}: ManuscriptsLemmatizerProps): JSX.Element {
  return (
    <>
      {manuscripts.map(
        (manuscript: ManuscriptLine, manuscriptIndex: number) => (
          <ManuscriptLineLemmatizer
            key={manuscriptIndex}
            fragmentService={fragmentService}
            chapter={chapter}
            line={manuscript}
            data={data[manuscriptIndex]}
            onChange={onChange(manuscriptIndex)}
          />
        )
      )}
    </>
  )
}

interface ChapterLineLemmatizerProps {
  data: LineLemmatization
  fragmentService: FragmentService
  chapter: Chapter
  line: Line
  onChange: (lemmatization: LineLemmatization) => void
}

function ChapterLineLemmatizater({
  data,
  fragmentService,
  chapter,
  line,
  onChange,
}: ChapterLineLemmatizerProps) {
  const [reconstructionLemmatization, manuscriptsLemmatization] = data

  const handleReconstructionChange = (index: number) => (
    uniqueLemma: UniqueLemma
  ) =>
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
              ? lemmatizationToken.setUniqueLemma(uniqueLemma, true)
              : lemmatizationToken
          })
        )
      }),
    ])

  const handleManuscriptChange = (manuscriptIndex: number) => (
    index: number
  ) => (uniqueLemma: UniqueLemma) =>
    onChange([
      reconstructionLemmatization,
      produce(manuscriptsLemmatization, (draft) => {
        draft[manuscriptIndex][index] = castDraft(
          draft[manuscriptIndex][index].setUniqueLemma(uniqueLemma)
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
  wordService: WordService
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
  const handleChange = (lineIndex: number) => (
    lemmatization: LineLemmatization
  ) =>
    setChapterLemmatization(
      produce(chapterLemmatization, (draft) => {
        draft[lineIndex] = castDraft(lemmatization)
      })
    )
  return (
    <Container>
      <Badge variant="warning">Beta</Badge>
      {chapter.lines.map((line, lineIndex) => (
        <ChapterLineLemmatizater
          key={lineIndex}
          line={line}
          data={chapterLemmatization[lineIndex]}
          fragmentService={fragmentService}
          chapter={chapter}
          onChange={handleChange(lineIndex)}
        />
      ))}
      <Button onClick={() => onSave(chapterLemmatization)} disabled={disabled}>
        Save lemmatization
      </Button>
    </Container>
  )
}

const ChapterLemmatizerWithData = withData<
  WithoutData<ChapterLemmatizerProps>,
  { wordService: WordService },
  readonly [readonly LemmatizationToken[], readonly LemmatizationToken[][]][]
>(
  ChapterLemmatizer,
  (props) =>
    Promise.mapSeries(props.chapter.lines, (line) =>
      Promise.all([
        findSuggestions(
          props.fragmentService,
          props.wordService,
          line.reconstructionTokens
        ),
        Promise.mapSeries(line.manuscripts, (manuscript) =>
          findSuggestions(
            props.fragmentService,
            props.wordService,
            manuscript.atfTokens
          )
        ),
      ])
    ),
  {
    watch: (props) => [props.chapter.lines],
  }
)

export default ChapterLemmatizerWithData
