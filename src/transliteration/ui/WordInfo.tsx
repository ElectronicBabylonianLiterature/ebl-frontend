import React, { PropsWithChildren, useContext, useMemo } from 'react'
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
import LineGroupContext from './LineGroupContext'
import { LineDetails } from 'corpus/domain/line-details'
import TextService from 'corpus/application/TextService'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { LineToken } from './line-tokens'

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

const InfoWithData = withData<
  unknown,
  { word: LemmatizableToken; dictionary: WordService },
  DictionaryWord[]
>(
  ({ data }) => (
    <ol className="word-info__words">
      {data.map((word, index) => (
        <WordItem key={index} word={word} />
      ))}
    </ol>
  ),
  ({ word, dictionary }) => dictionary.findAll(word.uniqueLemma)
)

function AlignedTokens({
  manuscripts,
  tokenIndex,
}: {
  manuscripts: LineToken[][]
  tokenIndex: number | null
}) {
  console.log(manuscripts)
  return (
    <>
      {manuscripts.map((tokens) =>
        tokens.map(
          (token, index) =>
            token.token.alignment === tokenIndex &&
            tokenIndex !== null && (
              <div key={index}>{token.token.cleanValue}</div>
            )
        )
      )}
    </>
  )
}

const AlignmentsWithData = withData<
  { tokenIndex: number | null },
  {
    id: ChapterId
    lineNumber: number
    variantNumber: number
    textService: TextService
  },
  LineDetails
>(
  ({ data: line, tokenIndex }): JSX.Element => {
    const lineGroup = useContext(LineGroupContext)
    const manuscriptLines = line.manuscriptsOfVariant

    lineGroup?.setManuscriptLines(manuscriptLines)

    return (
      <AlignedTokens
        manuscripts={lineGroup?.manuscriptLines || [[]]}
        tokenIndex={tokenIndex}
      />
    )
  },
  ({ id, lineNumber, variantNumber, textService }) =>
    textService.findChapterLine(id, lineNumber, variantNumber)
)

export default function WordInfo({
  word,
  tokenIndex = null,
  tokenClasses,
  children,
}: PropsWithChildren<{
  word: LemmatizableToken
  tokenClasses: readonly string[]
  tokenIndex?: number | null
}>): JSX.Element {
  const dictionary = useDictionary()

  const lineGroup = useContext(LineGroupContext)

  const info = useMemo(
    () => <InfoWithData word={word} dictionary={dictionary} />,
    [dictionary, word]
  )

  function Alignments() {
    return lineGroup && lineGroup.manuscriptLines === null ? (
      <AlignmentsWithData
        id={lineGroup.chapterId}
        lineNumber={lineGroup.lineNumber}
        variantNumber={lineGroup.variantNumber}
        textService={lineGroup.textService}
        tokenIndex={tokenIndex}
      />
    ) : (
      <AlignedTokens
        manuscripts={lineGroup?.manuscriptLines || [[]]}
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
        <Alignments />
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
            onMouseEnter={() => lineGroup?.setActiveTokenIndex(tokenIndex)}
            onMouseLeave={() => lineGroup?.setActiveTokenIndex(null)}
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
