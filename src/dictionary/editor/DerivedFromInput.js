import React, { Component, Fragment } from 'react'
import { FormGroup, Button } from 'react-bootstrap'

import FormInput from './FormInput'

class DerivedFromInput extends Component {
  onChange = value => {
    this.props.onChange(value)
  }

  render () {
    return (
      <FormGroup>
        <label>Derived from</label>
        {this.props.value ? (
          <Fragment>
            <FormInput id={this.props.id} value={this.props.value} onChange={this.props.onChange} />
            <Button onClick={() => this.props.onChange(null)} size='sm' variant='outline-secondary'>Delete derived from</Button>
          </Fragment>
        ) : (
          <Button onClick={() => this.props.onChange({ lemma: [], homonym: '', notes: [] })} size='sm' variant='outline-secondary'>Add derived from</Button>
        )}
      </FormGroup>
    )
  }
}

export default DerivedFromInput
