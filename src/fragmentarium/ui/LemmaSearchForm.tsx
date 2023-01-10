import React from 'react'
import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import LemmatizationForm, {
  LemmaOption,
} from './lemmatization/LemmatizationForm'
import Lemma from 'transliteration/domain/Lemma'
import withData from 'http/withData'
import WordService from 'dictionary/application/WordService'
import Word from 'dictionary/domain/Word'

function createOptions(lemmaIds: string[], words: readonly Word[]) {
  const lemmaMap: ReadonlyMap<string, LemmaOption> = new Map(
    words.map((word) => [word._id, new LemmaOption(word)])
  )

  return _.compact(lemmaIds.map((lemma) => lemmaMap.get(lemma)))
}

export const LemmaSearchForm = withData<
  {
    fragmentService: FragmentService
    onChange: (name: string) => (name: string) => void
  },
  { wordService: WordService; lemmas: string },
  Lemma[]
>(
  ({ data, fragmentService, onChange }) => {
    return (
      <LemmatizationForm
        fragmentService={fragmentService}
        onChange={(selection) => {
          onChange('lemmas')(selection.map((lemma) => lemma.value).join('+'))
        }}
        isMulti={true}
        uniqueLemma={data}
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
