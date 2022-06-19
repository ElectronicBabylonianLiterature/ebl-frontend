import React from 'react'
import Bluebird from 'bluebird'
import WordService from 'dictionary/application/WordService'
import Word from 'dictionary/domain/Word'
import withData from 'http/withData'
import _ from 'lodash'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LemmatizableToken } from 'transliteration/domain/token'
import { LineToken } from './line-tokens'
import { LemmaMap, useLineLemmasContext } from './LineLemmasContext'
import DictionaryWord from 'dictionary/domain/Word'

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
    lemmaSetter: React.Dispatch<React.SetStateAction<LemmaMap>>
    word: LemmatizableToken
    lemmaKeys: readonly string[]
  },
  {
    dictionary: WordService
    lemmaKeys: readonly string[]
  },
  [string, DictionaryWord][]
>(
  ({ data: lemmaEntries, word, lemmaSetter }): JSX.Element => {
    const lemmaMap = new Map<string, DictionaryWord>(lemmaEntries)
    useEffect(() => lemmaSetter(lemmaMap))

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

export default function LemmaInfo({
  word,
  dictionary,
  manuscriptLines = [[]],
}: {
  word: LemmatizableToken
  dictionary: WordService
  manuscriptLines?: LineToken[][]
}): JSX.Element {
  const { lemmaKeys, lemmaMap, lemmaSetter } = useLineLemmasContext()
  const hasLemmas = word.uniqueLemma.every((lemmaKey: string) =>
    lemmaMap.has(lemmaKey)
  )

  const allLemmaKeys: readonly string[] = [
    ...lemmaKeys,
    ...manuscriptLines.flatMap((tokens) =>
      tokens.flatMap((token) => token.token.uniqueLemma)
    ),
  ].filter((lemmaKey) => !_.isNil(lemmaKey))

  return hasLemmas ? (
    <Info word={word} lemmaMap={lemmaMap} />
  ) : (
    <InfoWithData
      word={word}
      dictionary={dictionary}
      lemmaKeys={allLemmaKeys}
      lemmaSetter={lemmaSetter}
    />
  )
}
