import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'
import WordService from 'dictionary/application/WordService'
import Word from 'dictionary/domain/Word'
import { LemmaOption } from './lemmatization/LemmaSelectionForm'
import LemmaSelectionForm from './lemmatization/LemmaSelectionForm'
import Select from 'react-select'
import { QueryType } from 'query/FragmentQuery'

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
    wordService: WordService
    onChange: (name: string) => (name: string) => void
    isDisabled?: boolean
    placeholder?: string
  },
  { lemmas: string },
  LemmaOption[]
>(
  ({ data, wordService, onChange, isDisabled, placeholder }) => {
    return (
      <LemmaSelectionForm
        wordService={wordService}
        onChange={(query) => {
          onChange('lemmas')(query.map((lemma) => lemma.value).join('+'))
        }}
        query={data}
        isDisabled={isDisabled}
        placeholder={placeholder}
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

export function LemmaQueryTypeForm({
  value,
  onChange,
}: {
  value: QueryType
  onChange: (value: string) => void
}): JSX.Element {
  const lemmaOptions = {
    line: 'Same line',
    phrase: 'Exact phrase',
    and: 'Same text',
    or: 'Anywhere',
  }
  return (
    <Select
      aria-label="Select lemma query type"
      options={Object.entries(lemmaOptions).map(([value, label]) => ({
        value: value,
        label: label,
      }))}
      value={{
        value: value,
        label: lemmaOptions[value],
      }}
      onChange={(event): void => onChange(event?.value || 'line')}
      className={'script-selection__selection'}
    />
  )
}
