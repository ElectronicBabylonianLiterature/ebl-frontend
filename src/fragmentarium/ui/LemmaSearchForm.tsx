import React from 'react'
import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import WordService from 'dictionary/application/WordService'
import Word from 'dictionary/domain/Word'
import { LemmaOption } from './lemmatization/LemmaSelectionForm'
import LemmaSelectionForm from './lemmatization/LemmaSelectionForm'

function createOptions(lemmaIds: string[], words: readonly Word[]) {
  const lemmaMap: ReadonlyMap<string, Word> = new Map(
    words.map((word) => [word._id, word])
  )

  return _.compact(
    lemmaIds.map((lemma) =>
      _.isNil(lemmaMap.get(lemma))
        ? null
        : new LemmaOption(lemmaMap.get(lemma) as Word)
    )
  )
}

export const LemmaSearchForm = withData<
  {
    fragmentService: FragmentService
    onChange: (name: string) => (name: string) => void
  },
  { wordService: WordService; lemmas: string },
  LemmaOption[]
>(
  ({ data, fragmentService, onChange }) => {
    return (
      <LemmaSelectionForm
        fragmentService={fragmentService}
        onChange={(query) => {
          onChange('lemmas')(query.map((lemma) => lemma.value).join('+'))
        }}
        query={data}
      />
    )
  },
  ({ wordService, lemmas }) => {
    const lemmaIds = lemmas.split('+')
    return wordService
      .findAll(lemmaIds)
      .then(_.partial(createOptions, lemmaIds))
  },
  {
    filter: (props) => !_.isNil(props.lemmas),
    defaultData: () => [],
  }
)
