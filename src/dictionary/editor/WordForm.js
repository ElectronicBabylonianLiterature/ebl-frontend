import React, { Component, Fragment } from 'react'
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap'
import _ from 'lodash'

import LemmaInput from './LemmaInput'
import ListInput from './ListInput'
import FormList from './FormList'
import FormInput from './FormInput'
import LogogramList from './LogogramList'
import DerivedList from './DerivedList'

import './WordForm.css'

class WordForm extends Component {
  constructor (props) {
    super(props)

    this.state = {
      word: this.props.value
    }
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

  updateDerived = newIndex => newGroup => {
    this.onChangeValue('derived')(_(this.state.word.derived)
      .map((group, index) =>
        index === newIndex
          ? newGroup
          : group
      )
      .compact()
      .value()
    )
  }

  render () {
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

    return (
      <form className='WordForm'>
        <LemmaInput id='lemma' value={this.state.word} onChange={this.updateWord} />
        <FormGroup controlId='legacyLemma'>
          <ControlLabel>Legacy Lemma</ControlLabel>
          <FormControl
            type='text'
            value={this.state.word.legacyLemma}
            onChange={this.onChangeEvent('legacyLemma')} />
        </FormGroup>
        <FormGroup controlId='homonym'>
          <ControlLabel>Homonym</ControlLabel>
          <FormControl
            type='text'
            value={this.state.word.homonym}
            onChange={this.onChangeEvent('homonym')} />
        </FormGroup>

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

        <FormList
          id='forms'
          value={this.state.word.forms}
          onChange={this.onChangeValue('forms')}
          fields={['lemma', 'attested', 'notes']}>Forms</FormList>

        <FormGroup controlId='meaning'>
          <ControlLabel>Meaning</ControlLabel>
          <FormControl
            type='text'
            value={this.state.word.meaning}
            onChange={this.onChangeEvent('meaning')} />
        </FormGroup>

        <FormGroup controlId='amplifiedMeaning'>
          <ControlLabel>Amplified meanings</ControlLabel>
          <ul>
            {_.map(this.state.word.amplifiedMeanings, (amplifiedMeaning, key) =>
              <li key={key}>
                <FormGroup controlId={`amplifiedMeaning-${key}-conjugationfunction`}>
                  <ControlLabel>Conjugation/Function</ControlLabel>
                  <FormControl type='text' value={key} onChange={_.noop} />
                </FormGroup>
                <FormGroup controlId={`amplifiedMeaning-${key}-meaning`}>
                  <ControlLabel>Meaning</ControlLabel>
                  <FormControl type='text' value={amplifiedMeaning.meaning} onChange={_.noop} />
                </FormGroup>
                <FormGroup>
                  <label>Vowels</label>
                  <ul>
                    {amplifiedMeaning.vowels.map((vowel, index) =>
                      <li key={index}>
                        <FormGroup controlId={`amplifiedMeaning-${key}-vowels-${index}-value`}>
                          <ControlLabel>Value</ControlLabel>
                          <FormControl type='text' value={vowel.value.join('/')} onChange={_.noop} />
                        </FormGroup>
                        <ListInput id={`amplifiedMeaning-${key}-vowels-${index}-notes`} value={vowel.notes} onChange={_.noop}>
                          Notes
                        </ListInput>
                        <Button>Delete vowels</Button>
                      </li>
                    )}
                    <li><Button>Add vowels</Button></li>
                  </ul>
                </FormGroup>

                <FormGroup>
                  <label>Entries</label>
                  <ol>
                    {amplifiedMeaning.entries.map((entry, entryIndex) =>
                      <li key={entryIndex}>
                        <FormGroup controlId={`amplifiedMeaning-${key}-entry-${entryIndex}-meaning`}>
                          <ControlLabel>Meaning</ControlLabel>
                          <FormControl type='text' value={entry.meaning} onChange={_.noop} />
                        </FormGroup>
                        <FormGroup>
                          <label>Vowels</label>
                          <ul>
                            {entry.vowels.map((vowel, index) =>
                              <li key={index}>
                                <FormGroup controlId={`amplifiedMeaning-${key}-entry-${entryIndex}-vowels-${index}-value`}>
                                  <ControlLabel>Value</ControlLabel>
                                  <FormControl type='text' value={vowel.value.join('/')} onChange={_.noop} />
                                </FormGroup>
                                <ListInput id={`amplifiedMeaning-${key}-entry-${entryIndex}-vowels-${index}-notes`} value={vowel.notes} onChange={_.noop}>
                                  Notes
                                </ListInput>
                                <Button>Delete vowels</Button>
                              </li>
                            )}
                            <li><Button>Add vowels</Button></li>
                          </ul>
                        </FormGroup>
                        <Button>Delete entry</Button>
                      </li>
                    )}
                    <li><Button>Add entry</Button></li>
                  </ol>
                </FormGroup>
                <Button>Delete amplified meaning</Button>
              </li>
            )}
            <li><Button>Add amplified meaning</Button></li>
          </ul>
        </FormGroup>

        <LogogramList id='logograms' value={this.state.word.logograms} onChange={this.onChangeValue('logograms')}>
          Logograms
        </LogogramList>

        <DerivedList id='derived' value={this.state.word.derived} onChange={this.onChangeValue('derived')}>
          Derived
        </DerivedList>

        <FormGroup>
          <label>Derived from</label>
          {this.state.word.derivedFrom ? (
            <Fragment>
              <FormInput id='derivedFrom' value={this.state.word.derivedFrom} onChange={this.onChangeValue('derivedFrom')} />
              <Button onClick={() => this.onChangeValue('derivedFrom')(null)}>Delete derived from</Button>
            </Fragment>
          ) : (
            <Button onClick={() => this.onChangeValue('derivedFrom')({lemma: [], homonym: '', notes: []})}>Add derived from</Button>
          )}
        </FormGroup>

        <Button type='submit' bsStyle='primary'>Save</Button>
        {process.env.NODE_ENV === 'development' && (
          <div>
            <h3>JSON preview</h3>
            <pre>{JSON.stringify(this.state.word, null, 2)}</pre>
          </div>
        )}
      </form>
    )
  }
}

export default WordForm
