import React, { Component } from 'react'
import { FormGroup } from 'react-bootstrap'

import TextInput from './TextInput'
import List from './List'

class ListInput extends Component {
  render () {
    return (
      <FormGroup>
        <List
          label={this.props.children}
          value={this.props.value}
          onChange={this.props.onChange}
          default=''>
          {this.props.value.map((item, index) =>
            <TextInput
              key={index}
              id={`${this.props.id}-${index}`}
              value={item} />
          )}
        </List>
      </FormGroup>
    )
  }
}

export default ListInput
