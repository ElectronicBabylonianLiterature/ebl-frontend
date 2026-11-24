import React, { Component } from 'react'
import { FormGroup, FormLabel, FormControl } from 'react-bootstrap'
import _ from 'lodash'

import TextListInput from 'dictionary/ui/editor/TextListInput'
import { NAMED_ENTITY_TAGS } from 'dictionary/domain/namedEntityTags'
import Word from 'dictionary/domain/Word'
import {
  POSITIONS_OF_SPEECH,
  VERB_POSITION_OF_SPEECH,
} from 'dictionary/domain/positionsOfSpeech'

const posOptions = _.map(POSITIONS_OF_SPEECH, (value, key) => ({
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
  value: readonly string[]
  options: readonly SelectOption[]
  onChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
}): JSX.Element {
  return (
    <FormGroup controlId={_.uniqueId(idPrefix)}>
      <FormLabel>{label}</FormLabel>
      <FormControl as="select" value={[...value]} onChange={onChange} multiple>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormControl>
    </FormGroup>
  )
}

type PosValue = Pick<Word, 'pos' | 'namedEntityTags' | 'roots'>

class PosInput extends Component<{
  value: PosValue
  onChange: (update: Partial<PosValue>) => void
}> {
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

  updateRoots = (roots: readonly string[]): void => {
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
        {this.props.value.pos.includes(VERB_POSITION_OF_SPEECH) && (
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
