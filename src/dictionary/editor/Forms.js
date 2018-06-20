import React, { Component, Fragment } from 'react'
import { FormGroup, ControlLabel, FormControl, Checkbox, Button } from 'react-bootstrap'
import _ from 'lodash'

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
                <FormGroup>
                  <FormGroup controlId={`forms-${index}-attested`}>
                    <ControlLabel>Attested</ControlLabel>
                    <Checkbox checked={form.attested} onChange={_.noop} />
                  </FormGroup>
                  <FormGroup controlId={`forms-${index}-lemma`}>
                    <ControlLabel>Lemma</ControlLabel>
                    <FormControl type='text' value={form.lemma.join(' ')} onChange={_.noop} />
                  </FormGroup>
                </FormGroup>
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
