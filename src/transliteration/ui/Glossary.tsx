import React from 'react'
import { Text } from 'transliteration/domain/text'
import DictionaryWord from 'dictionary/domain/Word'
import withData from 'http/withData'
import Promise from 'bluebird'
import WordService from 'dictionary/application/WordService'
import produce, { castDraft, Draft } from 'immer'
import GlossaryLine from './GlossaryLine'
import {
  GlossaryData,
  compareGlossaryEntries,
} from 'transliteration/domain/glossary'

import './Glossary.sass'

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
