import React from 'react'
import _ from 'lodash'
import ExternalLink from 'common/ui/ExternalLink'
import WordService from 'dictionary/application/WordService'
import Word from 'dictionary/domain/Word'
import useRequestState from 'common/hooks/useRequestState'
import { Logogram } from 'signs/domain/Sign'
import {
  LogogramSpelling,
  groupLogogramsByWord,
  isLogogramCrossReference,
  ungroupedLogograms,
} from 'signs/domain/schrammLogogram'
import {
  LogogramText,
  Spelling,
  WordLink,
} from 'signs/ui/display/SignLogogramParts'

function useLogogramWords(
  wordIds: readonly string[],
  wordService: WordService,
): ReadonlyMap<string, Word> {
  const ids = [...new Set(wordIds)].sort()
  const state = useRequestState(
    ids.length > 0 ? ids.join('\n') : null,
    (signal) => wordService.findAll(ids, signal),
  )
  return new Map(
    state.status === 'loaded' ? state.data.map((word) => [word._id, word]) : [],
  )
}

function OtherLogograms({
  spellings,
}: {
  spellings: readonly LogogramSpelling[]
}): JSX.Element {
  return (
    <li className="SignPage__logogram-word">
      <span className="SignPage__logogram-lemma">Without dictionary word</span>
      <ul className="SignPage__logogram-spellings">
        {spellings.map((spelling) => (
          <Spelling key={spelling.id} spelling={spelling} lemma="" />
        ))}
      </ul>
    </li>
  )
}

export default function SignLogogramsByWord({
  logograms,
  wordService,
}: {
  logograms: readonly Logogram[]
  wordService: WordService
}): JSX.Element {
  const words = groupLogogramsByWord(logograms)
  const others = ungroupedLogograms(logograms)
  const dictionaryWords = useLogogramWords(
    logograms.flatMap((logogram) => logogram.wordId),
    wordService,
  )
  const crossReferences = _.uniqBy(
    logograms.filter(isLogogramCrossReference),
    (logogram) => logogram.logogram,
  )
  return (
    <>
      <ul className="SignPage__logograms">
        {words.map(({ wordId, lemma, otherWordIds, spellings }) => (
          <li key={wordId} className="SignPage__logogram-word">
            <WordLink wordId={wordId} word={dictionaryWords.get(wordId)} />
            {otherWordIds.map((other) => (
              <React.Fragment key={other}>
                {' + '}
                <WordLink wordId={other} word={dictionaryWords.get(other)} />
              </React.Fragment>
            ))}
            <ul className="SignPage__logogram-spellings">
              {spellings.map((spelling) => (
                <Spelling key={spelling.id} spelling={spelling} lemma={lemma} />
              ))}
            </ul>
          </li>
        ))}
        {others.length > 0 && <OtherLogograms spellings={others} />}
      </ul>
      {crossReferences.length > 0 && (
        <p className="SignPage__note">
          Cross-references:{' '}
          {crossReferences.map((logogram, index) => (
            <React.Fragment key={logogram.logogram}>
              {index > 0 && ' · '}
              <LogogramText logogram={logogram.logogram} />
            </React.Fragment>
          ))}
        </p>
      )}
      <p className="SignPage__note">
        From W. Schramm,{' '}
        <em>Akkadische Logogramme. Zweite, revidierte Auflage</em>. Göttinger
        Beiträge zum Alten Orient 5. Göttingen: Universitätsverlag Göttingen,{' '}
        <sup>2</sup>2010 (
        <ExternalLink href="https://creativecommons.org/licenses/by-nd/3.0/de/">
          CC BY-ND 3.0
        </ExternalLink>
        ,{' '}
        <ExternalLink href="https://doi.org/10.17875/gup2010-511">
          doi:10.17875/gup2010-511
        </ExternalLink>
        ).
      </p>
    </>
  )
}
