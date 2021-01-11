import React, { Component, FormEvent, useState } from 'react'
import { Button } from 'react-bootstrap'
import _ from 'lodash'

import LemmaInput from './LemmaInput'
import FormList from './FormList'
import ArrayWithNotesList from './ArrayWithNotesList'
import DerivedList from './DerivedList'
import TextInput from './TextInput'
import AmplifiedMeaningList from './AmplifiedMeaningList'
import DerivedFromInput from './DerivedFromInput'
import PosInput from './PosInput'
import OraccWordsList from './OraccWordsList'
import Word from 'dictionary/domain/Word'

interface Props {
  value: Word
  onSubmit: (word: Word) => void
  disabled: boolean
}

export default function WordForm({
  value,
  onSubmit,
  disabled,
}: Props): JSX.Element {
  const [word, setWord] = useState(value)
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onSubmit(word)
  }

  const updateWord = (updatedFields: Partial<Word>): void => {
    setWord({ ...word, ...updatedFields })
  }

  const onChangeValue = (key: string) => (value: any): void => {
    updateWord({ [key]: value })
  }

  const TextInputDisplay = ({ property }): JSX.Element => (
    <TextInput value={word[property]} onChange={onChangeValue(property)}>
      {_.startCase(property)}
    </TextInput>
  )

  const Lemma = (): JSX.Element => (
    <LemmaInput value={word} onChange={updateWord} />
  )

  const Pos = (): JSX.Element => <PosInput value={word} onChange={updateWord} />

  const AmplifiedMeanings = (): JSX.Element => (
    <AmplifiedMeaningList
      value={word.amplifiedMeanings}
      onChange={onChangeValue('amplifiedMeanings')}
    >
      Amplified meanings
    </AmplifiedMeaningList>
  )

  const Forms = (): JSX.Element => (
    <FormList
      value={word.forms}
      onChange={onChangeValue('forms')}
      fields={['lemma', 'attested', 'notes']}
    >
      Forms
    </FormList>
  )

  const Logograms = (): JSX.Element => (
    <ArrayWithNotesList
      value={word.logograms}
      separator=" "
      property="logogram"
      noun="logogram"
      onChange={onChangeValue('logograms')}
    />
  )

  const Derived = (): JSX.Element => (
    <DerivedList value={word.derived} onChange={onChangeValue('derived')}>
      Derived
    </DerivedList>
  )

  const DerivedFrom = (): JSX.Element => (
    <DerivedFromInput
      value={word.derivedFrom}
      onChange={onChangeValue('derivedFrom')}
    />
  )

  const OraccWords = (): JSX.Element => (
    <OraccWordsList
      value={word.oraccWords}
      onChange={onChangeValue('oraccWords')}
    />
  )

  return (
    <form className="WordForm" onSubmit={submit}>
      <fieldset disabled={disabled}>
        <Lemma />
        <TextInputDisplay property="legacyLemma" />
        <TextInputDisplay property="homonym" />
        <Pos />
        <TextInputDisplay property="meaning" />
        <hr />

        <Forms />
        <hr />

        <AmplifiedMeanings />
        <hr />

        <Logograms />
        <hr />

        <Derived />
        <hr />

        <DerivedFrom />
        <hr />

        <TextInputDisplay property="guideWord" />
        <OraccWords />

        <Button type="submit" variant="primary">
          Save
        </Button>
      </fieldset>
    </form>
  )
}
