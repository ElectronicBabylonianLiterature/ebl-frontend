import React, { Component, FormEvent } from 'react'
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
class WordForm extends Component<Props, { word: Word }> {
  constructor(props: Props) {
    super(props)

    this.state = {
      word: this.props.value,
    }
  }

  submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    this.props.onSubmit(this.state.word)
  }

  updateWord = (updatedFields: Partial<Word>): void => {
    this.setState({
      word: {
        ...this.state.word,
        ...updatedFields,
      },
    })
  }

  onChangeValue =
    (key: string) =>
    (value: unknown): void => {
      this.updateWord({ [key]: value })
    }

  textInput = ({ property }: { property: string }): JSX.Element => (
    <TextInput
      value={this.state.word[property]}
      onChange={this.onChangeValue(property)}
    >
      {_.startCase(property)}
    </TextInput>
  )

  lemma = (): JSX.Element => (
    <LemmaInput value={this.state.word} onChange={this.updateWord} />
  )

  pos = (): JSX.Element => (
    <PosInput value={this.state.word} onChange={this.updateWord} />
  )

  amplifiedMeanings = (): JSX.Element => (
    <AmplifiedMeaningList
      value={this.state.word.amplifiedMeanings}
      onChange={this.onChangeValue('amplifiedMeanings')}
    >
      Amplified meanings
    </AmplifiedMeaningList>
  )

  forms = (): JSX.Element => (
    <FormList
      value={this.state.word.forms}
      onChange={this.onChangeValue('forms')}
      fields={['lemma', 'attested', 'notes']}
    >
      Forms
    </FormList>
  )

  logograms = (): JSX.Element => (
    <ArrayWithNotesList
      value={this.state.word.logograms}
      separator=" "
      property="logogram"
      noun="logogram"
      onChange={this.onChangeValue('logograms')}
    />
  )

  derived = (): JSX.Element => (
    <DerivedList
      value={this.state.word.derived}
      onChange={this.onChangeValue('derived')}
    >
      Derived
    </DerivedList>
  )

  derivedFrom = (): JSX.Element => (
    <DerivedFromInput
      value={this.state.word.derivedFrom}
      onChange={this.onChangeValue('derivedFrom')}
    />
  )

  oraccWords = (): JSX.Element => (
    <OraccWordsList
      value={this.state.word.oraccWords}
      onChange={this.onChangeValue('oraccWords')}
    />
  )

  render(): JSX.Element {
    return (
      <form className="WordForm" onSubmit={this.submit}>
        <fieldset disabled={this.props.disabled}>
          <this.lemma />
          <this.textInput property="legacyLemma" />
          <this.textInput property="homonym" />
          <this.pos />
          <this.textInput property="meaning" />
          <hr />

          <this.forms />
          <hr />

          <this.amplifiedMeanings />
          <hr />

          <this.logograms />
          <hr />

          <this.derived />
          <hr />

          <this.derivedFrom />
          <hr />

          <this.textInput property="guideWord" />
          <this.oraccWords />

          <Button type="submit" variant="primary">
            Save
          </Button>
        </fieldset>
      </form>
    )
  }
}

export default WordForm
