import React, { Component } from 'react'
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap'
import _ from 'lodash'

import TextListInput from './TextListInput'

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

class PosInput extends Component {
  updatePos = event => {
    this.props.onChange({pos: event.target.value})
  }

  updateRoots = roots => {
    this.props.onChange({roots: roots})
  }
  render () {
    return (
      <FormGroup>
        <FormGroup controlId={this.props.id}>
          <ControlLabel>Position of speech</ControlLabel>
          <FormControl componentClass='select' value={this.props.value.pos} onChange={this.updatePos}>
            {posOptions.map(option =>
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )}
          </FormControl>
        </FormGroup>
        {this.props.value.pos === 'V' &&
          <TextListInput id='roots' value={this.props.value.roots || []} onChange={this.updateRoots}>
            Roots
          </TextListInput>
        }
      </FormGroup>
    )
  }
}

export default PosInput
