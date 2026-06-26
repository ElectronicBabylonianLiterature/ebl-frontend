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

type SelectOption = { value: string; label: string }

function MultiSelectFormGroup({
  idPrefix,
  label,
  value,
  options,
  onChange,
}: {
  idPrefix: string
  label: string
  value: string[]
  options: readonly SelectOption[]
  onChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
}): JSX.Element {
  return (
    <FormGroup controlId={_.uniqueId(idPrefix)}>
      <FormLabel>{label}</FormLabel>
      <FormControl as="select" value={value} onChange={onChange} multiple>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormControl>
    </FormGroup>
  )
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
        <MultiSelectFormGroup
          idPrefix="PosInput-"
          label="Position of speech"
          value={this.props.value.pos}
          options={posOptions}
          onChange={this.updatePos}
        />
        <MultiSelectFormGroup
          idPrefix="NamedEntityInput-"
          label="Named entity (proper noun) type"
          value={this.props.value.namedEntityTags ?? []}
          options={namedEntityOptions}
          onChange={this.updateNamedEntityTags}
        />
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
