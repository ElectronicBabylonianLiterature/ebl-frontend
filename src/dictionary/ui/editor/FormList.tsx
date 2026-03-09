/* eslint-disable react/prop-types */
import React from 'react'
import { FormGroup } from 'react-bootstrap'
import _ from 'lodash'

import FormInput from './FormInput'
import List from 'common/List'

const defaultForm = {
  lemma: [],
  attested: true,
  homonym: '',
  notes: [],
}
export default function FormList({
  value,
  fields,
  onChange,
  children,
}): JSX.Element {
  const defaultValue = () => {
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
        {(form, onChange) => <FormInput onChange={onChange} value={form} />}
      </List>
    </FormGroup>
  )
}
