import React from 'react'
import { FormGroup } from 'react-bootstrap'
import _ from 'lodash'

import FormInput from './FormInput'
import List from 'common/ui/List'

const defaultForm = {
  lemma: [],
  attested: true,
  homonym: '',
  notes: [],
}

type DictionaryForm = {
  lemma?: readonly string[]
  attested?: boolean
  homonym?: string
  notes?: readonly string[]
}

type Props = {
  value: readonly unknown[]
  fields?: string[]
  onChange: (value: unknown) => void
  children?: React.ReactNode
}

export default function FormList({
  value,
  fields,
  onChange,
  children,
}: Props): JSX.Element {
  const defaultValue = (): DictionaryForm => {
    const fieldsResult = fields || _.keys(defaultForm)
    return _.pick(defaultForm, fieldsResult)
  }
  return (
    <FormGroup>
      <List
        label={children}
        value={value}
        onChange={onChange}
        noun="form"
        defaultValue={defaultValue}
      >
        {(form, onChange) => (
          <FormInput
            onChange={onChange as (word: unknown) => void}
            value={form}
          />
        )}
      </List>
    </FormGroup>
  )
}
