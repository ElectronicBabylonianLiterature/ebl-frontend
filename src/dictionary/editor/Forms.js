import React, { Component, Fragment } from 'react'
import { FormGroup, ControlLabel, Button } from 'react-bootstrap'
import _ from 'lodash'

import LemmaInput from './LemmaInput'
import ListInput from './ListInput'

class Forms extends Component {
  render () {
    return (
      <FormGroup>
        <ControlLabel>Forms</ControlLabel>
        {this.props.value.map((form, index) =>
          <FormGroup key={index}>
            {_.isString(form) ? (
              <span>{form}</span>
            ) : (
              <Fragment>
                <LemmaInput id={`forms-${index}-lemma`} value={form} onChange={_.noop} />
                <ListInput id={`forms-${index}-notes`} value={form.notes} onChange={_.noop}>
                  Notes
                </ListInput>
              </Fragment>
            )}
            <Button>Delete form</Button>
          </FormGroup>
        )}
        <Button>Add form</Button>
      </FormGroup>
    )
  }
}

export default Forms
