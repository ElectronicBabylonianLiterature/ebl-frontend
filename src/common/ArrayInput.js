import React, { Component } from 'react'
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap'
import _ from 'lodash'

class ArrayInput extends Component {
  constructor (props) {
    super(props)
    this.id = _.uniqueId('ArrayInput-')
  }

  onChange = event => {
    const array = event.target.value.split(this.props.separator)
    this.props.onChange(array)
  }

  render () {
    return (
      <FormGroup controlId={this.id}>
        <ControlLabel>{this.props.children}</ControlLabel>
        <FormControl
          type='text'
          value={this.props.value.join(this.props.separator)}
          onChange={this.onChange} />
      </FormGroup>
    )
  }
}

export default ArrayInput
