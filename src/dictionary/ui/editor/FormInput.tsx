import React from 'react'
import { FormGroup } from 'react-bootstrap'
import _ from 'lodash'

import LemmaInput from './LemmaInput'
import ListInput from './TextListInput'
import TextInput from './TextInput'
export default function FormInput({
  value,
  onChange,
}: {
  value
  onChange: (word) => void
}): JSX.Element {
  const lemmaChanged = (lemma): void => {
    onChange({
      ...value,
      ...lemma,
    })
  }
  const homonymChanged = (homonym): void => {
    onChange({
      ...value,
      homonym: homonym,
    })
  }
  const notesChanged = (notes): void => {
    onChange({
      ...value,
      notes: notes,
    })
  }

  const hasProperty = (property): boolean => _.has(value, property)

  return (
    <FormGroup>
      <LemmaInput value={value} onChange={lemmaChanged} />
      {hasProperty('homonym') && (
        <TextInput value={value.homonym} onChange={homonymChanged}>
          Homonym
        </TextInput>
      )}
      {hasProperty('notes') && (
        <ListInput value={value.notes} onChange={notesChanged}>
          Notes
        </ListInput>
      )}
    </FormGroup>
  )
}
