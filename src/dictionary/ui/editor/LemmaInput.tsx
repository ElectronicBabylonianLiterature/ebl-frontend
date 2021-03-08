import React, { ChangeEvent } from 'react'
import { FormControl, FormGroup, FormLabel, InputGroup } from 'react-bootstrap'
import _ from 'lodash'

export default function LemmaInput({
  value,
  onChange,
}: {
  value: { lemma: readonly string[]; attested?: boolean }
  onChange: (lemma) => void
}): JSX.Element {
  const lemmaChanged = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    onChange({
      ...value,
      lemma: event.target.value.split(' '),
    })
  }

  const LemmaFormControl = (): JSX.Element => (
    <FormControl
      type="text"
      value={value.lemma.join(' ')}
      onChange={lemmaChanged}
    />
  )

  const attestedChanged = (event: ChangeEvent<HTMLInputElement>): void => {
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
