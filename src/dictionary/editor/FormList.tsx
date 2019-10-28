import React, { Component } from 'react'
import { FormGroup } from 'react-bootstrap'
import _ from 'lodash'

import FormInput from './FormInput'
import List from 'common/List'

const defaultForm = {
  lemma: [],
  attested: true,
  homonym: '',
  notes: []
}

class FormList extends Component<{ value; fields; onChange }> {
  get defaultValue() {
    const fields = this.props.fields || _.keys(defaultForm)
    return _.pick(defaultForm, fields)
  }

  render() {
    return (
      <FormGroup>
        <List
          label={this.props.children}
          value={this.props.value}
          onChange={this.props.onChange}
          noun="form"
          defaultValue={this.defaultValue}
        >
          {(form, onChange) => <FormInput onChange={onChange} value={form} />}
        </List>
      </FormGroup>
    )
  }
}

export default FormList
