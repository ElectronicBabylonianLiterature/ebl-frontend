import React, { Component, ReactNode } from 'react'
import { FormGroup } from 'react-bootstrap'

import TextInput from './TextInput'
import List from 'common/List'

class ListInput extends Component<{ value; onChange; children?: ReactNode }> {
  render(): JSX.Element {
    return (
      <FormGroup>
        <List
          label={this.props.children}
          value={this.props.value}
          onChange={this.props.onChange}
          defaultValue=""
        >
          {(item, onChange) => <TextInput onChange={onChange} value={item} />}
        </List>
      </FormGroup>
    )
  }
}

export default ListInput
