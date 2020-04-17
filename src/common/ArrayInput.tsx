import React, { Component } from 'react'
import { FormGroup, FormLabel, FormControl } from 'react-bootstrap'
import _ from 'lodash'

class ArrayInput extends Component<{ value; onChange; separator }> {
  private readonly id: string

  constructor(props) {
    super(props)
    this.id = _.uniqueId('ArrayInput-')
  }

  onChange = (event) => {
    const value = event.target.value
    const array = _.isEmpty(value) ? [] : value.split(this.props.separator)
    this.props.onChange(array)
  }

  render() {
    return (
      <FormGroup controlId={this.id}>
        <FormLabel>{this.props.children}</FormLabel>
        <FormControl
          type="text"
          value={this.props.value.join(this.props.separator)}
          onChange={this.onChange}
        />
      </FormGroup>
    )
  }
}

export default ArrayInput
