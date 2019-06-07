import React, { Component } from 'react'
import _ from 'lodash'
import { FormGroup, FormLabel, FormControl } from 'react-bootstrap'

class TextInput extends Component {
  onChange = event => {
    this.props.onChange(event.target.value)
  }

  render() {
    return (
      <FormGroup controlId={_.uniqueId('TextInput-')}>
        {this.props.children && <FormLabel>{this.props.children}</FormLabel>}
        <FormControl
          type="text"
          value={this.props.value}
          onChange={this.onChange}
        />
      </FormGroup>
    )
  }
}

export default TextInput
