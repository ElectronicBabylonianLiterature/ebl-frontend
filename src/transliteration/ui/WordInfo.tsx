import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import { LemmatizableToken } from 'transliteration/domain/token'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import withData from 'http/withData'
import { useDictionary } from 'dictionary/ui/dictionary-context'
import DictionaryWord from 'dictionary/domain/Word'
import WordService from 'dictionary/application/WordService'
import Word from 'dictionary/domain/Word'
import { Link } from 'react-router-dom'
import classNames from 'classnames'

import './WordInfo.sass'
import { useLineGroupContext } from './LineGroupContext'
import { LineDetails } from 'corpus/domain/line-details'
import { LineToken } from './line-tokens'
import { LineGroup } from './LineGroup'

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
  { lemmaSetter: React.Dispatch<React.SetStateAction<DictionaryWord[]>> },
  {
    word: LemmatizableToken
    dictionary: WordService
  },
  DictionaryWord[]
>(
  ({ data: lemma, lemmaSetter }) => {
    useEffect(() => lemmaSetter(lemma))
    return <Info lemma={lemma} />
  },
  ({ word, dictionary, lemmaSetter }) => dictionary.findAll(word.uniqueLemma)
)

function AlignedTokens({
  manuscripts,
  tokenIndex,
}: {
  manuscripts: LineToken[][]
  tokenIndex: number
}) {
  return (
    <>
      {manuscripts.map((lineTokens) =>
        lineTokens.map(
          (lineToken, index) =>
            lineToken.alignment === tokenIndex && (
              <div key={index}>{lineToken.token.cleanValue}</div>
            )
        )
      )}
    </>
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
}: PropsWithChildren<{
  word: LemmatizableToken
  tokenClasses: readonly string[]
}>): JSX.Element {
  const dictionary = useDictionary()

  const lineGroup = useLineGroupContext()
  const [lemma, lemmaSetter] = useState<DictionaryWord[]>([])

  const info = useMemo(
    () =>
      _.isEmpty(lemma) ? (
        <InfoWithData
          word={word}
          dictionary={dictionary}
          lemmaSetter={lemmaSetter}
        />
      ) : (
        <Info lemma={lemma} />
      ),
    [dictionary, lemma, word]
  )

  function Alignments({ tokenIndex }: { tokenIndex: number }) {
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
        {word.sentenceIndex && <Alignments tokenIndex={word.sentenceIndex} />}
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
