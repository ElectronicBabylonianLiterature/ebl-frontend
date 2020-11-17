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
  return Promise.all(
    tokens.map((token) =>
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
  onChange: (line: Line) => void
}

function ReconstructionLemmatization(props: RecontsructionLemmatizationProps) {
  const [lemmatization, setLemmatization] = useState(props.data)
  const handleChange = (index: number) => (uniqueLemma: UniqueLemma) => {
    setLemmatization(
      setLemmatizationToken(
        lemmatization,
        index,
        lemmatization[index].setUniqueLemma(uniqueLemma)
      )
    )
    props.onChange(setReconstructionLemma(props.line, index, uniqueLemma))
  }
  return (
    <Row>
      <Col md={3}>{props.line.number}</Col>
      <Col md={9}>
        {lemmatization.map((token, index) => (
          <Fragment key={index}>
            {token.lemmatizable ? (
              <WordLemmatizer
                fragmentService={props.fragmentService}
                token={token}
                onChange={handleChange(index)}
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

const ReconstructionLemmatizationWithData = withData<
  WithoutData<RecontsructionLemmatizationProps>,
  { wordService: WordService },
  readonly LemmatizationToken[]
>(ReconstructionLemmatization, (props) =>
  findSuggestions(
    props.fragmentService,
    props.wordService,
    props.line.reconstructionTokens
  )
)

function setManuscriptLemma(
  manuscriptLine: ManuscriptLine,
  index: number,
  uniqueLemma: UniqueLemma
): ManuscriptLine {
  return produce(manuscriptLine, (draft: Draft<ManuscriptLine>) => {
    draft.atfTokens[index].uniqueLemma = uniqueLemma.map((lemma) => lemma.value)
  })
}

interface ManuscriptLineLemmatizationProps {
  data: readonly LemmatizationToken[]
  fragmentService: FragmentService
  chapter: Chapter
  line: Line
  manuscriptLine: ManuscriptLine
  onChange: (line: ManuscriptLine) => void
}

function ManuscriptLineLemmatization(props: ManuscriptLineLemmatizationProps) {
  const [lemmatization, setLemmatization] = useState(props.data)
  const handleChange = (index: number) => (uniqueLemma: UniqueLemma) => {
    setLemmatization(
      setLemmatizationToken(
        lemmatization,
        index,
        lemmatization[index].setUniqueLemma(uniqueLemma)
      )
    )
    props.onChange(setManuscriptLemma(props.manuscriptLine, index, uniqueLemma))
  }
  return (
    <Row>
      <Col md={1} />
      <Col md={1}>{props.chapter.getSiglum(props.manuscriptLine)}</Col>
      <Col md={1}>
        {props.manuscriptLine.labels} {props.manuscriptLine.number}
      </Col>
      <Col md={9}>
        {lemmatization.map((token, index) => (
          <Fragment key={index}>
            {token.lemmatizable ? (
              <WordLemmatizer
                fragmentService={props.fragmentService}
                token={token}
                onChange={handleChange(index)}
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

const ManuscriptLineLemmatizationWithData = withData<
  WithoutData<ManuscriptLineLemmatizationProps>,
  { wordService: WordService },
  readonly LemmatizationToken[]
>(ManuscriptLineLemmatization, (props) =>
  findSuggestions(
    props.fragmentService,
    props.wordService,
    props.manuscriptLine.atfTokens
  )
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
    <Container>
      <Badge variant="warning">Beta</Badge>
      {chapter.lines.map((line, lineIndex) => (
        <section key={lineIndex}>
          <ReconstructionLemmatizationWithData
            line={line}
            fragmentService={fragmentService}
            wordService={wordService}
            chapter={chapter}
            onChange={(line) =>
              onChange(
                produce(chapter, (draft: Draft<Chapter>) => {
                  draft.lines[lineIndex] = castDraft(line)
                })
              )
            }
          />
          {line.manuscripts.map((manuscript, manuscriptIndex) => (
            <ManuscriptLineLemmatizationWithData
              key={manuscriptIndex}
              fragmentService={fragmentService}
              wordService={wordService}
              chapter={chapter}
              line={line}
              manuscriptLine={manuscript}
              onChange={handleChange(lineIndex)(manuscriptIndex)}
            />
          ))}
        </section>
      ))}
      <Button onClick={() => onSave()} disabled={disabled}>
        Save lemmatization
      </Button>
    </Container>
  )
}
