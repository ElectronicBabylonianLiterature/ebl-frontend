import React, { Component } from 'react'
import { FormGroup, Button } from 'react-bootstrap'
import _ from 'lodash'

import FormInput from './FormInput'

const defaultForm = {
  lemma: [],
  attested: true,
  homonym: '',
  notes: []
}

class FormList extends Component {
  add = () => {
    const fields = this.props.fields || _.keys(defaultForm)
    this.props.onChange([...this.props.value, _.pick(defaultForm, fields)])
  }

  delete = index => () => {
    this.props.onChange(_.reject(this.props.value, (item, itemIndex) => index === itemIndex))
  }

  update = index => updatedForm => {
    this.props.onChange(
      _.map(this.props.value, (form, formIndex) => index === formIndex
        ? updatedForm
        : form
      )
    )
  }

  render () {
    return (
      <FormGroup>
        <label>{this.props.children}</label>
        <ul>
          {this.props.value.map((form, index) =>
            <li key={index}>
              {_.isString(form)
                ? <span>{form}</span>
                : <FormInput id={`${this.props.id}-${index}`} value={form} onChange={this.update(index)} />
              }
              <Button onClick={this.delete(index)}>Delete form</Button>
            </li>
          )}
          <li><Button onClick={this.add}>Add form</Button></li>
        </ul>
      </FormGroup>
    )
  }
}

export default FormList
