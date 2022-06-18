import React, { PropsWithChildren, useEffect } from 'react'
import _ from 'lodash'
import { LemmatizableToken, Token } from 'transliteration/domain/token'
import { OverlayTrigger, Popover, Col, Container, Row } from 'react-bootstrap'
import withData from 'http/withData'
import { useDictionary } from 'dictionary/ui/dictionary-context'
import DictionaryWord from 'dictionary/domain/Word'
import WordService from 'dictionary/application/WordService'
import Word from 'dictionary/domain/Word'
import { Link } from 'react-router-dom'
import classNames from 'classnames'

import './WordInfo.sass'
import { LineDetails } from 'corpus/domain/line-details'
import { LineToken } from './line-tokens'
import { LineGroup } from './LineGroup'
import DisplayToken from './DisplayToken'
import { numberToUnicodeSubscript } from 'transliteration/application/SubIndex'
import { LemmaMap, useLineLemmasContext } from './LineLemmasContext'
import Bluebird from 'bluebird'

function WordItem({ word }: { word: Word }): JSX.Element {
  return (
    <li className="word-info__word">
      <span className="word-info__lemma">{word.lemma.join(' ')}</span>{' '}
      <span className="word-info__homonym">{word.homonym}</span>,{' '}
      {word.guideWord && (
        <span className="word-info__guide-word">
          &ldquo;{word.guideWord}&rdquo;
        </span>
      )}{' '}
      <Link
        to={`/dictionary/${word._id}`}
        target="_blank"
        aria-label="Open the word in the Dictionary."
      >
        <i className="fas fa-external-link-alt" />
      </Link>
    </li>
  )
}

function Info({
  word,
  lemmaMap,
}: {
  word: LemmatizableToken
  lemmaMap: LemmaMap
}): JSX.Element {
  const lemmas: Word[] = word.uniqueLemma
    .map((lemmaKey) => lemmaMap.get(lemmaKey))
    .filter((lemma) => !_.isNil(lemma)) as Word[]

  return (
    <ol className="word-info__words">
      {lemmas.map((word, index) => (
        <WordItem key={index} word={word} />
      ))}
    </ol>
  )
}

const InfoWithData = withData<
  {
    lemmasSetter: React.Dispatch<React.SetStateAction<LemmaMap>>
    word: LemmatizableToken
    lemmaKeys: readonly string[]
  },
  {
    dictionary: WordService
    lemmaKeys: readonly string[]
  },
  [string, DictionaryWord][]
>(
  ({ data: lemmaEntries, word, lemmasSetter }) => {
    const lemmaMap = new Map<string, DictionaryWord>(lemmaEntries)
    useEffect(() => lemmasSetter(lemmaMap))

    return <Info word={word} lemmaMap={lemmaMap} />
  },
  ({ dictionary, lemmaKeys }) =>
    Bluebird.all(
      lemmaKeys.map((uniqueLemma) =>
        dictionary
          .find(uniqueLemma)
          .then((lemma: DictionaryWord) => [uniqueLemma, lemma])
      )
    )
)

function LemmaInfo({
  word,
  dictionary,
}: {
  word: LemmatizableToken
  dictionary: WordService
}): JSX.Element {
  const { lemmaKeys, lemmaMap, lemmasSetter } = useLineLemmasContext()

  return _.isEmpty(lemmaMap) ? (
    <InfoWithData
      word={word}
      dictionary={dictionary}
      lemmaKeys={lemmaKeys}
      lemmasSetter={lemmasSetter}
    />
  ) : (
    <Info word={word} lemmaMap={lemmaMap} />
  )
}

function AlignedTokens({
  manuscripts,
  tokenIndex,
}: {
  manuscripts: LineToken[][]
  tokenIndex: number
}) {
  const alignedTokens = manuscripts.flatMap((tokens) =>
    tokens.filter((token) => token.alignment === tokenIndex)
  )
  let variantNumber = 1
  return (
    <Container className="word-info__aligned-tokens">
      {_(alignedTokens)
        .groupBy((token) => token.cleanValue)
        .map((tokens, index) => {
          const lineToken = tokens[0]
          const sigla = tokens
            .map((token: LineToken) => token.siglum)
            .join(', ')
          return (
            <React.Fragment key={index}>
              {lineToken.isVariant && (
                <Row className="word-info__words">
                  <Col className="word-info__variant-heading">{`Variant${numberToUnicodeSubscript(
                    variantNumber++
                  )}:`}</Col>
                </Row>
              )}
              <Row className="word-info__words">
                <Col className="word-info__sigla">{sigla}</Col>
                <Col>
                  <DisplayToken key={index} token={lineToken.token as Token} />
                </Col>
              </Row>
            </React.Fragment>
          )
        })
        .value()}
    </Container>
  )
}

const AlignmentsWithData = withData<
  { lineGroup: LineGroup; tokenIndex: number },
  {
    lineGroup: LineGroup
  },
  LineDetails
>(
  ({ data: line, lineGroup, tokenIndex }): JSX.Element => {
    lineGroup.setManuscriptLines(line.manuscriptsOfVariant)

    return (
      <AlignedTokens
        manuscripts={lineGroup.manuscriptLines || [[]]}
        tokenIndex={tokenIndex}
      />
    )
  },
  ({ lineGroup }) => lineGroup.findChapterLine()
)

export default function WordInfo({
  word,
  tokenClasses,
  children,
  lineGroup = null,
}: PropsWithChildren<{
  word: LemmatizableToken
  tokenClasses: readonly string[]
  lineGroup?: LineGroup | null
}>): JSX.Element {
  const dictionary = useDictionary()
  const isInLineGroup = lineGroup !== null && word.sentenceIndex

  function Alignments({
    tokenIndex,
    lineGroup,
  }: {
    tokenIndex: number
    lineGroup: LineGroup
  }) {
    return lineGroup.manuscriptLines === null ? (
      <AlignmentsWithData lineGroup={lineGroup} tokenIndex={tokenIndex} />
    ) : (
      <AlignedTokens
        manuscripts={lineGroup.manuscriptLines || [[]]}
        tokenIndex={tokenIndex}
      />
    )
  }

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <Popover.Title>
        <span className={classNames(['word-info__header', ...tokenClasses])}>
          {children}
        </span>
      </Popover.Title>
      <Popover.Content>
        <LemmaInfo word={word} dictionary={dictionary} />
        {isInLineGroup && (
          <Alignments tokenIndex={word.sentenceIndex} lineGroup={lineGroup} />
        )}
      </Popover.Content>
    </Popover>
  )

  return (
    <>
      {word.uniqueLemma.length > 0 ? (
        <OverlayTrigger
          trigger="click"
          rootClose
          placement="top"
          overlay={popover}
        >
          {isInLineGroup ? (
            <span
              className="word-info__trigger"
              onMouseEnter={() =>
                lineGroup.setActiveTokenIndex(word.sentenceIndex || 0)
              }
              onMouseLeave={() => lineGroup.setActiveTokenIndex(0)}
              role="button"
            >
              {children}
            </span>
          ) : (
            <span className="word-info__trigger" role="button">
              {children}
            </span>
          )}
        </OverlayTrigger>
      ) : (
        <>{children}</>
      )}
      {word.hasVariantAlignment && (
        <sup className="word-info__variant-alignment-indicator">‡</sup>
      )}
    </>
  )
}
