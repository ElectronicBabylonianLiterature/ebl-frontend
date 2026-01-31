import React, { ChangeEvent, Component } from 'react'
import { FormGroup, FormLabel, FormControl } from 'react-bootstrap'
import _ from 'lodash'

import TextListInput from './TextListInput'

const verb = 'V'

const positionsOfSpeech: { [key: string]: string } = {
  AJ: 'adjective',
  AV: 'adverb',
  N: 'noun',
  NU: 'number',
  [verb]: 'verb',
  DP: 'demonstrative pronoun',
  IP: 'independent/anaphoric pronoun',
  PP: 'possessive pronoun',
  QP: 'interrogative pronoun',
  RP: 'reflexive/reciprocal pronoun',
  XP: 'indefinite pronoun',
  REL: 'relative pronoun',
  DET: 'determinative pronoun',
  CNJ: 'conjunction',
  J: 'interjection',
  MOD: 'modal, negative, or conditional particle',
  PRP: 'preposition',
  SBJ: 'subjunction',
}

const properNouns: { [key: string]: string } = {
  AN: 'Agricultural (locus) Name',
  CN: 'Celestial Name',
  DN: 'Divine Name',
  EN: 'Ethnos Name',
  FN: 'Field Name',
  GN: 'Geographical Name (lands and other geographical entities without their own tag)',
  LN: 'Line Name (ancestral clan)',
  MN: 'Month Name',
  ON: 'Object Name',
  PN: 'Personal Name',
  QN: 'Quarter Name (city area)',
  RN: 'Royal Name',
  SN: 'Settlement Name',
  TN: 'Temple Name',
  WN: 'Watercourse Name',
  YN: 'Year Name',
}

const posOptions = _.map(
  { ...positionsOfSpeech, ...properNouns },
  (value, key) => ({
    value: key,
    label: value,
  }),
)

class PosInput extends Component<{ value; onChange }> {
  updatePos = (event: ChangeEvent<HTMLSelectElement>): void => {
    this.props.onChange({
      pos: _(event.target.options).filter('selected').map('value').value(),
    })
  }

  updateRoots = (roots): void => {
    this.props.onChange({ roots: roots })
  }

  render(): JSX.Element {
    return (
      <FormGroup>
        <FormGroup controlId={_.uniqueId('PosInput-')}>
          <FormLabel>Position of speech</FormLabel>
          <FormControl
            as="select"
            value={this.props.value.pos}
            onChange={this.updatePos}
            multiple
          >
            {posOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        {this.props.value.pos.includes(verb) && (
          <TextListInput
            value={this.props.value.roots || []}
            onChange={this.updateRoots}
          >
            Roots
          </TextListInput>
        )}
      </FormGroup>
    )
  }
}

export default PosInput
