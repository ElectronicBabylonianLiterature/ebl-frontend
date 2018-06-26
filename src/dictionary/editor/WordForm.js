import React, { Component } from 'react'
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap'
import _ from 'lodash'

import LemmaInput from './LemmaInput'
import ListInput from './ListInput'
import FormList from './FormList'
import LogogramList from './LogogramList'
import DerivedList from './DerivedList'
import TextInput from './TextInput'
import AmplifiedMeaningList from './AmplifiedMeaningList'
import DerivedFromInput from './DerivedFromInput'

import './WordForm.css'

const positionsOfScpeech = {
  '': 'undefined',
  'AJ': 'adjective',
  'AV': 'adverb',
  'N': 'noun',
  'NU': 'number',
  'V': 'verb',
  'DP': 'demonstrative pronoun',
  'IP': 'independent/anaphoric pronoun',
  'PP': 'possessive pronoun',
  'QP': 'interrogative pronoun',
  'RP': 'reflexive/reciprocal pronoun',
  'XP': 'indefinite pronoun',
  'REL': 'relative pronoun',
  'DET': 'determinative pronoun',
  'CNJ': 'conjunction',
  'J': 'interjection',
  'MOD': 'modal, negative, or conditional particle',
  'PRP': 'preposition',
  'SBJ': 'subjunction'
}
const posOptions = _.map(positionsOfScpeech, (value, key) => ({value: key, label: value}))

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

  onChangeEvent = key => event => {
    this.onChangeValue(key)(event.target.value)
  }

  jsonPreview = () => {
    return <div>
      <h3>JSON preview</h3>
      <pre>{JSON.stringify(this.state.word, null, 2)}</pre>
    </div>
  }

  render () {
    return (
      <form className='WordForm' onSubmit={this.submit}>
        <LemmaInput id='lemma' value={this.state.word} onChange={this.updateWord} />
        <TextInput
          id='legacyLemma'
          value={this.state.word.legacyLemma}
          onChange={this.onChangeValue('legacyLemma')}>
            Legacy Lemma
        </TextInput>
        <TextInput
          id='homonym'
          value={this.state.word.homonym}
          onChange={this.onChangeValue('homonym')}>
          Homonym
        </TextInput>

        <FormGroup>
          <FormGroup controlId='pos'>
            <ControlLabel>Position of speech</ControlLabel>
            <FormControl componentClass='select' value={this.state.word.pos} onChange={this.onChangeEvent('pos')}>
              {posOptions.map(option =>
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              )}
            </FormControl>
          </FormGroup>
          {this.state.word.pos === 'V' &&
            <ListInput id='roots' value={this.state.word.roots || []} onChange={this.onChangeValue('roots')}>
              Roots
            </ListInput>
          }
        </FormGroup>

        <TextInput
          id='meaning'
          value={this.state.word.meaning}
          onChange={this.onChangeValue('meaning')}>
          Meaning
        </TextInput>

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

        <LogogramList id='logograms' value={this.state.word.logograms} onChange={this.onChangeValue('logograms')}>
          Logograms
        </LogogramList>

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
