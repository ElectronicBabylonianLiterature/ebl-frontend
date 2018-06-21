import React, { Component } from 'react'
import { FormGroup, Button } from 'react-bootstrap'
import _ from 'lodash'

import LemmaInput from './LemmaInput'
import ListInput from './ListInput'

class Forms extends Component {
  render () {
    return (
      <FormGroup>
        <label>Forms</label>
        <ul>
          {this.props.value.map((form, index) =>
            <li key={index}>
              {_.isString(form) ? (
                <span>{form}</span>
              ) : (
                <FormGroup>
                  <LemmaInput id={`forms-${index}-lemma`} value={form} onChange={_.noop} />
                  <ListInput id={`forms-${index}-notes`} value={form.notes} onChange={_.noop}>
                    Notes
                  </ListInput>
                </FormGroup>
              )}
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
