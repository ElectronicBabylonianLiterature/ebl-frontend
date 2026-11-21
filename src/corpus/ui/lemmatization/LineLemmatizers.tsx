import React, { Fragment } from 'react'
import { ManuscriptLine, LineVariant } from 'corpus/domain/line'
import { Chapter } from 'corpus/domain/chapter'
import { Col, Row } from 'react-bootstrap'
import Word from 'fragmentarium/ui/lemmatization/Word'
import WordLemmatizer from 'fragmentarium/ui/lemmatization/WordLemmatizer'
import {
  UniqueLemma,
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import FragmentService from 'fragmentarium/application/FragmentService'

interface LineLemmatizerProps<T> {
  data: readonly LemmatizationToken[]
  fragmentService: FragmentService
  chapter: Chapter
  line: T
  onChange: (index: number) => (uniqueLemma: UniqueLemma) => void
}

export function WordLemmatizers({
  tokens,
  fragmentService,
  onChange,
  disabled = false,
}: {
  tokens: readonly LemmatizationToken[]
  fragmentService: Pick<FragmentService, 'searchLemma'>
  onChange: (index: number) => (uniqueLemma: UniqueLemma) => void
  disabled?: boolean
}): JSX.Element {
  const renderWord = (token: LemmatizationToken, index: number): JSX.Element =>
    disabled ? (
      <Word token={token} />
    ) : (
      <WordLemmatizer
        fragmentService={fragmentService}
        token={token}
        onChange={onChange(index)}
      />
    )

  return (
    <>
      {tokens.map((token, index) => (
        <Fragment key={index}>
          {token.lemmatizable ? renderWord(token, index) : token.value}{' '}
        </Fragment>
      ))}
    </>
  )
}

export function ReconstructionLemmatizer(
  props: LineLemmatizerProps<LineVariant>,
): JSX.Element {
  return (
    <Row>
      <Col md={2}></Col>
      <Col md={10}>
        <WordLemmatizers
          tokens={props.data}
          onChange={props.onChange}
          fragmentService={props.fragmentService}
        />
      </Col>
    </Row>
  )
}

function ManuscriptLineLemmatizer(
  props: LineLemmatizerProps<ManuscriptLine>,
): JSX.Element {
  return (
    <Row>
      <Col md={1}>{props.chapter.getSiglum(props.line)}</Col>
      <Col md={1}>
        {props.line.labels} {props.line.number}
      </Col>
      <Col md={10}>
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
    manuscriptIndex: number,
  ) => (index: number) => (uniqueLemma: UniqueLemma) => void
}

export function ManuscriptsLemmatizer({
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
        ),
      )}
    </>
  )
}
