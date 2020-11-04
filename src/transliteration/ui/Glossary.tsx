import React from 'react'
import { Text } from 'transliteration/domain/text'
import DictionaryWord from 'dictionary/domain/Word'
import withData from 'http/withData'
import Promise from 'bluebird'
import WordService from 'dictionary/application/WordService'
import produce, { castDraft, Draft } from 'immer'
import compareWord from 'transliteration/domain/compareWord'
import GlossaryLine from './GlossaryLine'
import { GlossaryEntry, GlossaryData } from 'transliteration/domain/glossary'

import './Glossary.sass'

function compareGlossaryEntries(
  [, [{ dictionaryWord: firstWord }]]: GlossaryEntry,
  [, [{ dictionaryWord: secondWord }]]: GlossaryEntry
): number {
  if (firstWord && secondWord) {
    return compareWord(firstWord, secondWord)
  } else {
    throw new Error(
      'Either of the glossary entries is missing the dictionary word.'
    )
  }
}

function Glossary({ data }: { data: GlossaryData }): JSX.Element {
  return (
    <section>
      <h4>Glossary</h4>
      {[...data].sort(compareGlossaryEntries).map(([lemma, tokensByLemma]) => (
        <GlossaryLine key={lemma} tokens={tokensByLemma} />
      ))}
    </section>
  )
}

function isDictionaryWord(word: DictionaryWord | null): word is DictionaryWord {
  return word !== null
}

export default withData<
  unknown,
  { text: Text; wordService: WordService },
  GlossaryData
>(Glossary, ({ text, wordService: dictionary }) => {
  return new Promise((resolve, reject) => {
    produce(text.glossary, async (draft: Draft<GlossaryData>) => {
      for (const [, tokens] of draft) {
        for (const token of tokens) {
          const word = await dictionary
            .find(token.uniqueLemma)
            .catch(() => null)
          if (isDictionaryWord(word)) {
            token.dictionaryWord = castDraft(word)
          }
        }
      }
    })
      .then(resolve)
      .catch(reject)
  })
})
