import React, { PropsWithChildren, useContext, useMemo } from 'react'
import _ from 'lodash'
import { LemmatizableToken } from 'transliteration/domain/token'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import withData from 'http/withData'
import { useDictionary } from 'dictionary/ui/dictionary-context'
import DictionaryWord from 'dictionary/domain/Word'
import WordService from 'dictionary/application/WordService'
import Bluebird from 'bluebird'
import Word from 'dictionary/domain/Word'
import { Link } from 'react-router-dom'
import classNames from 'classnames'

import './WordInfo.sass'
import AlignedManuscriptTokens, {
  LineInfoContext,
} from 'corpus/ui/AlignedManuscriptTokens'

export function WordItem({ word }: { word: Word }): JSX.Element {
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

export function fetchLemma({
  word,
  dictionary,
}: {
  word: LemmatizableToken
  dictionary: WordService
}): Bluebird<DictionaryWord[]> {
  return Bluebird.all(word.uniqueLemma.map((lemma) => dictionary.find(lemma)))
}

const Info = withData<
  unknown,
  { word: LemmatizableToken; dictionary: WordService },
  DictionaryWord[]
>(
  ({ data }): JSX.Element => (
    <ol className="word-info__words">
      {data.map((dictionaryWord, index) => (
        <WordItem key={index} word={dictionaryWord} />
      ))}
    </ol>
  ),
  fetchLemma
)

export default function WordInfo({
  word,
  tokenClasses,
  children,
  alignIndex,
}: PropsWithChildren<{
  word: LemmatizableToken
  tokenClasses: readonly string[]
  alignIndex?: number
}>): JSX.Element {
  const dictionary = useDictionary()
  const { chapterId, lineNumber, variantNumber, textService } = useContext(
    LineInfoContext
  )
  const alignedManuscriptTokens = useMemo(
    () =>
      alignIndex ? (
        <AlignedManuscriptTokens
          id={chapterId}
          lineNumber={lineNumber}
          variantNumber={variantNumber}
          textService={textService}
          alignIndex={alignIndex}
          dictionary={dictionary}
        ></AlignedManuscriptTokens>
      ) : null,
    [chapterId, dictionary, lineNumber, textService, alignIndex, variantNumber]
  )
  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <Popover.Title>
        <span className={classNames(['word-info__header', ...tokenClasses])}>
          {children}
        </span>
      </Popover.Title>
      <Popover.Content>
        <Info word={word} dictionary={dictionary} />
        {alignedManuscriptTokens}
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
          <span className="word-info__trigger" role="button">
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
