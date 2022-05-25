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
} from 'corpus/ui/PopoverAlignment'

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

const Info = withData<
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
  ({ word, dictionary }) =>
    Bluebird.all(word.uniqueLemma.map((lemma) => dictionary.find(lemma)))
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
  const { chapterId, lineNumber, variantNumber, textService } = useContext(
    LineInfoContext
  )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const AlignedManuscriptLines = useMemo(
    () => (
      <AlignedManuscriptTokens
        id={chapterId}
        lineNumber={lineNumber}
        variantNumber={variantNumber}
        textService={textService}
      ></AlignedManuscriptTokens>
    ),
    [chapterId, lineNumber, textService, variantNumber]
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
        {AlignedManuscriptLines}
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
