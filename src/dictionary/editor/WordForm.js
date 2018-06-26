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

import './WordForm.css'

class WordForm extends Component {
  constructor (props) {
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

  jsonPreview = () => {
    return <div>
      <h3>JSON preview</h3>
      <pre>{JSON.stringify(this.state.word, null, 2)}</pre>
    </div>
  }

  textInput = ({property}) => (
    <TextInput
      id={property}
      value={this.state.word[property]}
      onChange={this.onChangeValue(property)}>
      {_.startCase(property)}
    </TextInput>
  )

  render () {
    return (
      <form className='WordForm' onSubmit={this.submit}>
        <LemmaInput id='lemma' value={this.state.word} onChange={this.updateWord} />
        <this.textInput property='legacyLemma' />
        <this.textInput property='homonym' />
        <PosInput id='pos' value={this.state.word} onChange={this.updateWord} />
        <this.textInput property='meaning' />

        <hr />

        <FormList
          id='forms'
          value={this.state.word.forms}
          onChange={this.onChangeValue('forms')}
          fields={['lemma', 'attested', 'notes']}>Forms</FormList>

        <hr />

        <AmplifiedMeaningList
          id={`amplifiedMeaning`}
          value={this.state.word.amplifiedMeanings}
          onChange={this.onChangeValue('amplifiedMeanings')}>
          Amplified meanings
        </AmplifiedMeaningList>

        <hr />

        <ArrayWithNotesList id='logograms' value={this.state.word.logograms} onChange={this.onChangeValue('logograms')}>
          Logograms
        </ArrayWithNotesList>

        <hr />

        <DerivedList id='derived' value={this.state.word.derived} onChange={this.onChangeValue('derived')}>
          Derived
        </DerivedList>

        <hr />

        <DerivedFromInput id='derivedFrom' value={this.state.word.derivedFrom} onChange={this.onChangeValue('derivedFrom')} />

        <Button type='submit' bsStyle='primary'>Save</Button>
        {process.env.NODE_ENV === 'development' && <this.jsonPreview />}
      </form>
    )
  }
}

export default WordForm
