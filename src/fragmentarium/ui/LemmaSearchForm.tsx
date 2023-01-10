import React from 'react'
import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import LemmatizationForm from './lemmatization/LemmatizationForm'
import Lemma from 'transliteration/domain/Lemma'
import withData from 'http/withData'
import WordService from 'dictionary/application/WordService'

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
      .then((words) =>
        words
          .map((word) => new Lemma(word))
          .sort((a, b) => lemmaIds.indexOf(a.value) - lemmaIds.indexOf(b.value))
      )
  },
  {
    filter: (props) => !_.isNil(props.lemmas),
    defaultData: () => [],
  }
)
