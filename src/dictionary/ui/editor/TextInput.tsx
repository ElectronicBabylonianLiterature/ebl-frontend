import React, { ChangeEvent, Component, ReactNode } from 'react'
import _ from 'lodash'
import { FormGroup, FormLabel, FormControl } from 'react-bootstrap'

class TextInput extends Component<{ value; onChange; children?: ReactNode }> {
  onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.props.onChange(event.target.value)
  }

  render(): JSX.Element {
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
