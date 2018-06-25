import React, { Component } from 'react'
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap'

class TextInput extends Component {
  onChange = event => {
    this.props.onChange(event.target.value)
  }

  render () {
    return (
      <FormGroup controlId={`${this.props.id}`}>
        {this.props.children && <ControlLabel>{this.props.children}</ControlLabel>}
        <FormControl type='text' value={this.props.value} onChange={this.onChange} />
      </FormGroup>
    )
  }
}

export default TextInput
