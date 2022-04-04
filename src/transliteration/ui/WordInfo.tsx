import React, { PropsWithChildren } from 'react'
import _ from 'lodash'
import { LemmatizableToken } from 'transliteration/domain/token'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import withData from 'http/withData'
import { useDictionary } from 'dictionary/ui/dictionary-context'
import DictionaryWord from 'dictionary/domain/Word'
import WordService from 'dictionary/application/WordService'
import Bluebird from 'bluebird'

import './WordInfo.sass'
import Word from 'dictionary/domain/Word'
import { Link } from 'react-router-dom'

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
  children,
}: PropsWithChildren<{ word: LemmatizableToken }>): JSX.Element {
  const dictionary = useDictionary()

  const popover = (
    <Popover id={_.uniqueId('word-info-')}>
      <Popover.Title>
        <span className="word-info__header">{children}</span>
      </Popover.Title>
      <Popover.Content>
        <Info word={word} dictionary={dictionary} />
      </Popover.Content>
    </Popover>
  )

  return (
    <OverlayTrigger trigger="click" rootClose placement="top" overlay={popover}>
      <span className="word-info__trigger">{children}</span>
    </OverlayTrigger>
  )
}
