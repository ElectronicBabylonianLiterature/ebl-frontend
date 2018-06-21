import React, { Component } from 'react'
import { FormGroup, Button } from 'react-bootstrap'
import _ from 'lodash'

import FormInput from './FormInput'

class Forms extends Component {
  render () {
    return (
      <FormGroup>
        <label>Forms</label>
        <ul>
          {this.props.value.map((form, index) =>
            <li key={index}>
              {_.isString(form)
                ? <span>{form}</span>
                : <FormInput id={`forms-${index}`} value={form} onChange={_.noop} />
              }
              <Button>Delete form</Button>
            </li>
          )}
          <li><Button>Add form</Button></li>
        </ul>
      </FormGroup>
    )
  }
}

export default Forms
