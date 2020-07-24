import React from 'react'
import { Text, GlossaryToken } from 'transliteration/domain/text'
import DictionaryWord from 'dictionary/domain/Word'
import withData from 'http/withData'
import Promise from 'bluebird'
import WordService from 'dictionary/application/WordService'
import produce, { castDraft } from 'immer'
import compareWord from 'transliteration/domain/compareWord'
import GlossaryEntry from './GlossaryEntry'

import './Glossary.sass'

function compareGlossaryEntries(
  [, [{ dictionaryWord: firstWord }]]: [string, readonly GlossaryToken[]],
  [, [{ dictionaryWord: secondWord }]]: [string, readonly GlossaryToken[]]
): number {
  if (firstWord && secondWord) {
    return compareWord(firstWord, secondWord)
  } else {
    throw new Error(
      'Either of the glossary entries is missing the dictionary word.'
    )
  }
}

function Glossary({
  data,
}: {
  data: [string, readonly GlossaryToken[]][]
}): JSX.Element {
  return (
    <section>
      <h4>Glossary</h4>
      {[...data].sort(compareGlossaryEntries).map(([lemma, tokensByLemma]) => (
        <GlossaryEntry key={lemma} tokens={tokensByLemma} />
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
  [string, readonly GlossaryToken[]][]
>(Glossary, ({ text, wordService: dictionary }) => {
  return new Promise((resolve, reject) => {
    produce(text.glossary, async (draft) => {
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
