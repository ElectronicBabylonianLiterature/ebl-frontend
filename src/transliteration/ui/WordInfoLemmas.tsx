import React, { useContext, useMemo } from 'react'
import Bluebird from 'bluebird'
import WordService from 'dictionary/application/WordService'
import Word from 'dictionary/domain/Word'
import withData from 'http/withData'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LemmatizableToken } from 'transliteration/domain/token'
import { OneOfLineToken } from './line-tokens'
import {
  LemmaMap,
  updateLemmaMapKeys,
  useLineLemmasContext,
} from './LineLemmasContext'
import DictionaryWord from 'dictionary/domain/Word'
import { isLemma } from 'transliteration/domain/type-guards'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'

function WordItem({ word }: { word: Word }): JSX.Element {
  const useRouterLinks = useContext(RouterLinkModeContext)
  const dictionaryPath = `/dictionary/${word._id}`
  return (
    <li className="word-info__word">
      <span className="word-info__lemma">{word.lemma.join(' ')}</span>{' '}
      <span className="word-info__homonym">{word.homonym}</span>,{' '}
      {word.guideWord && (
        <span className="word-info__guide-word">
          &ldquo;{word.guideWord}&rdquo;
        </span>
      )}{' '}
      {useRouterLinks ? (
        <Link
          to={dictionaryPath}
          target="_blank"
          aria-label="Open the word in the Dictionary."
        >
          <i className="fas fa-external-link-alt" />
        </Link>
      ) : (
        <a
          href={dictionaryPath}
          target="_blank"
          aria-label="Open the word in the Dictionary."
          rel="noreferrer"
        >
          <i className="fas fa-external-link-alt" />
        </a>
      )}
    </li>
  )
}

const Info = withData<
  {
    lemmaSetter: React.Dispatch<React.SetStateAction<LemmaMap>>
    word: LemmatizableToken
    lemmaKeys: readonly string[]
    lemmaMap: LemmaMap
  },
  {
    dictionary: WordService
    lemmaKeys: readonly string[]
  },
  [string, DictionaryWord][]
>(
  ({ data: lemmaEntries, word, lemmaSetter }): JSX.Element => {
    const lemmaMap = useMemo(() => new Map(lemmaEntries), [lemmaEntries])
    useEffect(() => lemmaSetter(lemmaMap), [lemmaMap, lemmaSetter])

    const lemmas = word.uniqueLemma
      .map((lemmaKey) => lemmaMap.get(lemmaKey))
      .filter(isLemma)

    return (
      <ol className="word-info__words">
        {lemmas.map((word, index) => (
          <WordItem key={index} word={word} />
        ))}
      </ol>
    )
  },
  ({ dictionary, lemmaKeys }) =>
    Bluebird.all(
      lemmaKeys.map((uniqueLemma) =>
        dictionary
          .find(uniqueLemma)
          .then((lemma: DictionaryWord) => [uniqueLemma, lemma]),
      ),
    ),
  {
    filter: (props) =>
      !props.word.uniqueLemma.every((lemmaKey: string) =>
        props.lemmaMap.get(lemmaKey),
      ),
    defaultData: (props) =>
      [...props.lemmaMap.entries()] as [string, DictionaryWord][],
  },
)

export default function LemmaInfo({
  word,
  dictionary,
  manuscriptLines = [],
}: {
  word: LemmatizableToken
  dictionary: WordService
  manuscriptLines?: ReadonlyArray<ReadonlyArray<OneOfLineToken>>
}): JSX.Element {
  const { lemmaMap, lemmaSetter } = useLineLemmasContext()

  updateLemmaMapKeys(lemmaMap, manuscriptLines)

  return (
    <Info
      word={word}
      dictionary={dictionary}
      lemmaKeys={[...lemmaMap.keys()]}
      lemmaSetter={lemmaSetter}
      lemmaMap={lemmaMap}
    />
  )
}
