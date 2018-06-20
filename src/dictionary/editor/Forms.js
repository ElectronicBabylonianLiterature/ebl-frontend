import React, { Component, Fragment } from 'react'
import { FormGroup, ControlLabel, FormControl, InputGroup, Button } from 'react-bootstrap'
import _ from 'lodash'

import LemmaInput from './LemmaInput'

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
                <LemmaInput id={`forms-${index}-lemma`} value={form} />
                <FormGroup label='Notes' controlId={`forms-${index}-notes`}>
                  <ControlLabel>Notes</ControlLabel>
                  {form.notes.map((note, index) =>
                    <FormGroup key={index}>
                      <FormControl type='text' className='WordForm-notes_note' value={note} />
                      <Button className='WordForm-notes_delete'>Delete note</Button>
                    </FormGroup>
                  )}
                  <Button>Add note</Button>
                </FormGroup>
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
