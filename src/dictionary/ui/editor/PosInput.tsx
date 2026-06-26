import React, { Component } from 'react'
import { FormGroup, FormLabel, FormControl } from 'react-bootstrap'
import _ from 'lodash'

import TextListInput from './TextListInput'
import { NAMED_ENTITY_TAGS } from 'dictionary/domain/namedEntityTags'

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

const posOptions = _.map(positionsOfSpeech, (value, key) => ({
  value: key,
  label: value,
}))

const namedEntityOptions = _.map(NAMED_ENTITY_TAGS, (value, key) => ({
  value: key,
  label: value,
}))

function selectedValues(select: HTMLSelectElement): string[] {
  return _(select.options).filter('selected').map('value').value()
}

class PosInput extends Component<{ value; onChange }> {
  updatePos = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void => {
    this.props.onChange({
      pos: selectedValues(event.currentTarget as HTMLSelectElement),
    })
  }

  updateNamedEntityTags = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void => {
    this.props.onChange({
      namedEntityTags: selectedValues(event.currentTarget as HTMLSelectElement),
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
        <FormGroup controlId={_.uniqueId('NamedEntityInput-')}>
          <FormLabel>Named entity (proper noun) type</FormLabel>
          <FormControl
            as="select"
            value={this.props.value.namedEntityTags ?? []}
            onChange={this.updateNamedEntityTags}
            multiple
          >
            {namedEntityOptions.map((option) => (
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
