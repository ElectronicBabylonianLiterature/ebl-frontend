import React, { Component } from 'react'
import { FormGroup, FormLabel, FormControl, InputGroup } from 'react-bootstrap'
import _ from 'lodash'

export default function LemmaInput({ value, onChange }): JSX.Element {
  const lemmaChanged = (event): void => {
    onChange({
      ...value,
      lemma: event.target.value.split(' '),
    })
  }

  const LemmaFormControl = () => (
    <FormControl
      type="text"
      value={value.lemma.join(' ')}
      onChange={lemmaChanged}
    />
  )

  const attestedChanged = (event): void => {
    onChange({
      ...value,
      attested: event.target.checked,
    })
  }
  return (
    <FormGroup controlId={_.uniqueId('LemmaInput-')}>
      <FormLabel>Lemma</FormLabel>
      {_.has(value, 'attested') ? (
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Checkbox
              type="checkbox"
              aria-label="attested"
              checked={value.attested}
              onChange={attestedChanged}
            />
          </InputGroup.Prepend>
          <LemmaFormControl />
        </InputGroup>
      ) : (
        <LemmaFormControl />
      )}
    </FormGroup>
  )
}
