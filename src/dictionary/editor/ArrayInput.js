import React, { Component } from 'react'
import TextInput from './TextInput'

class ArrayInput extends Component {
  onChange = value => {
    this.props.onChange(value.split(this.props.separator))
  }

  render () {
    return (
      <TextInput
        id={`${this.props}`}
        value={this.props.value.join(this.props.separator)}
        onChange={this.onChange}>
        {this.props.children}
      </TextInput>
    )
  }
}

export default ArrayInput
