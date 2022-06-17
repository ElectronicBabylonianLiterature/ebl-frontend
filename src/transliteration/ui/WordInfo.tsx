import React, { PropsWithChildren, useEffect, useMemo } from 'react'
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
import { useLineLemmasContext } from './LineLemmasContext'
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

function Info({ lemma }: { lemma: DictionaryWord[] }): JSX.Element {
  return (
    <ol className="word-info__words">
      {lemma.map((word, index) => (
        <WordItem key={index} word={word} />
      ))}
    </ol>
  )
}

const InfoWithData = withData<
  {
    lemmasSetter: React.Dispatch<React.SetStateAction<DictionaryWord[][]>>
    word: LemmatizableToken
  },
  {
    dictionary: WordService
    lemmaKeys: (readonly string[])[]
  },
  DictionaryWord[][]
>(
  ({ data: lemmas, word, lemmasSetter }) => {
    useEffect(() => lemmasSetter(lemmas))
    // console.log(word.sentenceIndex)
    return word.sentenceIndex ? (
      <Info lemma={lemmas[word.sentenceIndex]} />
    ) : null
  },
  ({ dictionary, lemmaKeys }) =>
    Bluebird.all(
      lemmaKeys.map((uniqueLemma) => dictionary.findAll(uniqueLemma))
    )
)

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

  const { lemmaKeys, lemmas, lemmasSetter } = useLineLemmasContext()

  const info = useMemo(
    () =>
      _.isEmpty(lemmas) ? (
        <InfoWithData
          word={word}
          dictionary={dictionary}
          lemmaKeys={lemmaKeys}
          lemmasSetter={lemmasSetter}
        />
      ) : (
        word.sentenceIndex &&
        lemmas[word.sentenceIndex] && (
          <Info lemma={lemmas[word.sentenceIndex]} />
        )
      ),
    [dictionary, lemmaKeys, lemmas, lemmasSetter, word]
  )

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
        {info}
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
