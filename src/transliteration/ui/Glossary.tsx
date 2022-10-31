import React from 'react'
import { Text } from 'transliteration/domain/text'
import withData from 'http/withData'
import WordService from 'dictionary/application/WordService'
import GlossaryLine from './GlossaryLine'
import {
  GlossaryData,
  compareGlossaryEntries,
} from 'transliteration/domain/glossary'

import './Glossary.sass'
import GlossaryFactory from 'transliteration/application/GlossaryFactory'
import _ from 'lodash'

export function Glossary({ data }: { data: GlossaryData }): JSX.Element {
  return _.isEmpty(data) ? (
    <></>
  ) : (
    <section>
      <h4>Glossary</h4>
      {[...data].sort(compareGlossaryEntries).map(([lemma, tokensByLemma]) => (
        <GlossaryLine key={lemma} tokens={tokensByLemma} />
      ))}
    </section>
  )
}

export default withData<
  unknown,
  { text: Text; wordService: WordService },
  GlossaryData
>(Glossary, ({ text, wordService: dictionary }) => {
  return new GlossaryFactory(dictionary).createGlossary(text)
})
