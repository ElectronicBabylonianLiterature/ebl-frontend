import React, { Component, Fragment } from 'react'
import { FormGroup, ControlLabel, FormControl, Checkbox, Button } from 'react-bootstrap'
import _ from 'lodash'

import Forms from './Forms'

import './WordForm.css'

class WordForm extends Component {
  constructor (props) {
    super(props)

    this.state = {
      word: this.props.value
    }
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
        <FormGroup>
          <FormGroup controlId='attested'>
            <ControlLabel>Attested</ControlLabel>
            <Checkbox checked={this.state.word.attested} onChange={_.noop} />
          </FormGroup>
          <FormGroup controlId='lemma'>
            <ControlLabel>Lemma</ControlLabel>
            <FormControl
              type='text'
              value={this.state.word.lemma.join(' ')}
              onChange={_.noop} />
          </FormGroup>
          <FormGroup controlId='homonym'>
            <ControlLabel>Homonym</ControlLabel>
            <FormControl
              type='text'
              value={this.state.word.homonym}
              onChange={_.noop} />
          </FormGroup>
        </FormGroup>

        <FormGroup>
          <FormGroup controlId='pos'>
            <ControlLabel>POS</ControlLabel>
            <FormControl componentClass='select' value={this.state.word.pos} onChange={_.noop}>
              {posOptions.map(option =>
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              )}
            </FormControl>
          </FormGroup>
          {this.state.word.pos === 'V' &&
            <FormGroup controld='roots'>
              <ControlLabel>Roots</ControlLabel>
              {(this.state.word.roots || []).map((wordRoot, index) =>
                <FormGroup key={index} controld={`root-${index}`}>
                  <FormControl
                    type='text'
                    maxLength='3'
                    value={wordRoot}
                    onChange={_.noop} />
                  <Button>Delete root</Button>
                </FormGroup>
              )}
              <Button>Add root</Button>
            </FormGroup>
          }
        </FormGroup>

        <Forms value={this.state.word.forms} />

        <FormGroup controlId='meaning'>
          <ControlLabel>Meaning</ControlLabel>
          <FormControl
            type='text'
            value={this.state.word.meaning}
            onChange={_.noop} />
        </FormGroup>

        <FormGroup controlId='amplifiedMeaning'>
          <ControlLabel>Amplified meanings</ControlLabel>
          {_.map(this.state.word.amplifiedMeanings, (amplifiedMeaning, key) =>
            <FormGroup controlId={`amplifiedMeaning-${key}`} key={key}>
              <FormGroup controlId={`amplifiedMeaning-${key}-conjugationfunction`}>
                <ControlLabel>Conjugation/Function</ControlLabel>
                <FormControl type='text' value={key} onChange={_.noop} />
              </FormGroup>
              <FormGroup controlId={`amplifiedMeaning-${key}-meaning`}>
                <ControlLabel>Meaning</ControlLabel>
                <FormControl type='text' value={amplifiedMeaning.meaning} onChange={_.noop} />
              </FormGroup>
              <FormGroup controlId={`amplifiedMeaning-${key}-vowels`}>
                <ControlLabel>Vowels</ControlLabel>
                {amplifiedMeaning.vowels.map((vowel, index) =>
                  <FormGroup key={index} controlId={`amplifiedMeaning-${key}-vowels-${index}`}>
                    <FormGroup controlId={`amplifiedMeaning-${key}-vowels-${index}-value`}>
                      <ControlLabel>Value</ControlLabel>
                      <FormControl type='text' value={vowel.value.join('/')} onChange={_.noop} />
                    </FormGroup>
                    <FormGroup label='Notes' controlId={`amplifiedMeaning-${key}-vowels-${index}-notes`}>
                      <ControlLabel>Notes</ControlLabel>
                      {vowel.notes.map((note, index) =>
                        <FormGroup key={index}>
                          <FormControl type='text' value={note} onChange={_.noop} />
                          <Button>Delete note</Button>
                        </FormGroup>
                      )}
                      <Button>Add note</Button>
                    </FormGroup>
                    <Button>Delete vowels</Button>
                  </FormGroup>
                )}
                <Button>Add vowels</Button>
              </FormGroup>

              <FormGroup label='Entries'>
                {amplifiedMeaning.entries.map((entry, entryIndex) =>
                  <FormGroup controlId={`amplifiedMeaning-${key}-entry-${entryIndex}`} key={entryIndex}>
                    <FormGroup controlId={`amplifiedMeaning-${key}-entry-${entryIndex}-meaning`}>
                      <ControlLabel>Meaning</ControlLabel>
                      <FormControl type='text' value={entry.meaning} onChange={_.noop} />
                    </FormGroup>
                    <FormGroup controlId={`amplifiedMeaning-${key}-entry-${entryIndex}-vowels`}>
                      <ControlLabel>Vowels</ControlLabel>
                      {entry.vowels.map((vowel, index) =>
                        <FormGroup key={index} controlId={`amplifiedMeaning-${key}-entry-${entryIndex}-vowels-${index}`}>
                          <FormGroup controlId={`amplifiedMeaning-${key}-entry-${entryIndex}-vowels-${index}-value`}>
                            <ControlLabel>Value</ControlLabel>
                            <FormControl type='text' value={vowel.value.join('/')} onChange={_.noop} />
                          </FormGroup>
                          <FormGroup label='Notes' controlId={`amplifiedMeaning-${key}-entry-${entryIndex}-vowels-${index}-notes`}>
                            <ControlLabel>Notes</ControlLabel>
                            {vowel.notes.map((note, index) =>
                              <FormGroup key={index}>
                                <FormControl type='text' value={note} onChange={_.noop} />
                                <Button>Delete note</Button>
                              </FormGroup>
                            )}
                            <Button>Add note</Button>
                          </FormGroup>
                          <Button>Delete vowels</Button>
                        </FormGroup>
                      )}
                      <Button>Add vowels</Button>
                    </FormGroup>
                    <Button>Delete entry</Button>
                  </FormGroup>
                )}
                <Button>Add entry</Button>
              </FormGroup>
              <Button>Delete amplified meaning</Button>
            </FormGroup>
          )}
          <Button>Add amplified meaning</Button>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Logograms</ControlLabel>
          {_.map(this.state.word.logograms, (logogram, index) =>
            <FormGroup key={index}>
              <FormGroup>
                <ControlLabel>Logogram</ControlLabel>
                <FormControl type='text' value={logogram.logogram.join(' ')} onChange={_.noop} />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Notes</ControlLabel>
                {logogram.notes.map((note, index) =>
                  <FormGroup key={index}>
                    <FormControl type='text' value={note} onChange={_.noop} />
                    <Button>Delete note</Button>
                  </FormGroup>
                )}
                <Button>Add note</Button>
              </FormGroup>
              <Button>Delete Logogram</Button>
            </FormGroup>
          )}
          <Button>Add Logogram</Button>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Derived</ControlLabel>
          {this.state.word.derived.map((group, index) =>
            <FormGroup key={index}>
              {group.map((form, index) =>
                _.isString(form) ? (
                  <span key={index}>
                    {form}
                  </span>
                ) : (
                  <FormGroup key={index}>
                    <FormGroup>
                      <ControlLabel>Lemma</ControlLabel>
                      <FormControl type='text' value={form.lemma.join(' ')} onChange={_.noop} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Homonym</ControlLabel>
                      <FormControl type='text' value={form.homonym} onChange={_.noop} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Notes</ControlLabel>
                      {form.notes.map((note, index) =>
                        <FormGroup key={index}>
                          <FormControl type='text' value={note} onChange={_.noop} />
                          <Button>Delete note</Button>
                        </FormGroup>
                      )}
                      <Button>Add note</Button>
                    </FormGroup>
                    <Button>Delete form</Button>
                  </FormGroup>
                )
              )}
              <Button>Add form</Button>
              <Button>Delete group</Button>
            </FormGroup>
          )}
          <Button>Add group</Button>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Derived from</ControlLabel>
          {this.state.word.derivedFrom ? (
            <Fragment>
              <FormGroup>
                <ControlLabel>Lemma</ControlLabel>
                <FormControl type='text' value={this.state.word.derivedFrom.lemma.join(' ')} onChange={_.noop} />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Homonym</ControlLabel>
                <FormControl type='text' value={this.state.word.derivedFrom.homonym} onChange={_.noop} />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Notes</ControlLabel>
                {this.state.word.derivedFrom.notes.map((note, index) =>
                  <FormGroup key={index}>
                    <FormControl type='text' value={note} onChange={_.noop} />
                    <Button>Delete note</Button>
                  </FormGroup>
                )}
                <Button>Add note</Button>
              </FormGroup>
              <Button>Delete derived from</Button>
            </Fragment>
          ) : (
            <Button>Add derived from</Button>
          )}
        </FormGroup>

        <Button type='submit' bsStyle='primary'>Save</Button>
      </form>
    )
  }
}

export default WordForm
