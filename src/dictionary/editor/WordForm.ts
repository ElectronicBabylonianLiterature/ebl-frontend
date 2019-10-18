import React, { Component } from 'react'
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

class WordForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      word: this.props.value
    }
  }

  submit = event => {
    event.preventDefault()
    this.props.onSubmit(this.state.word)
  }

  updateWord = updatedFields => {
    this.setState({
      word: {
        ...this.state.word,
        ...updatedFields
      }
    })
  }

  onChangeValue = key => value => {
    this.updateWord({ [key]: value })
  }

  textInput = ({ property }) => (
    <TextInput
      value={this.state.word[property]}
      onChange={this.onChangeValue(property)}
    >
      {_.startCase(property)}
    </TextInput>
  )

  lemma = () => (
    <LemmaInput value={this.state.word} onChange={this.updateWord} />
  )

  pos = () => <PosInput value={this.state.word} onChange={this.updateWord} />

  amplifiedMeanings = () => (
    <AmplifiedMeaningList
      value={this.state.word.amplifiedMeanings}
      onChange={this.onChangeValue('amplifiedMeanings')}
    >
      Amplified meanings
    </AmplifiedMeaningList>
  )

  forms = () => (
    <FormList
      value={this.state.word.forms}
      onChange={this.onChangeValue('forms')}
      fields={['lemma', 'attested', 'notes']}
    >
      Forms
    </FormList>
  )

  logograms = () => (
    <ArrayWithNotesList
      value={this.state.word.logograms}
      separator=" "
      property="logogram"
      noun="logogram"
      onChange={this.onChangeValue('logograms')}
    />
  )

  derived = () => (
    <DerivedList
      value={this.state.word.derived}
      onChange={this.onChangeValue('derived')}
    >
      Derived
    </DerivedList>
  )

  derivedFrom = () => (
    <DerivedFromInput
      value={this.state.word.derivedFrom}
      onChange={this.onChangeValue('derivedFrom')}
    />
  )

  jsonPreview = () => {
    return (
      <div>
        <h3>JSON preview</h3>
        <pre>{JSON.stringify(this.state.word, null, 2)}</pre>
      </div>
    )
  }

  render() {
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

          <Button type="submit" variant="primary">
            Save
          </Button>
        </fieldset>
      </form>
    )
  }
}

export default WordForm
