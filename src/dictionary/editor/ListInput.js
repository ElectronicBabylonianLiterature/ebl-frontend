import React, { Component } from 'react'
import { FormGroup, Button } from 'react-bootstrap'
import _ from 'lodash'

import TextInput from './TextInput'

class ListInput extends Component {
  add = () => {
    this.props.onChange([...this.props.value, ''])
  }

  delete = index => () => {
    this.props.onChange(_.compact([
      ...this.props.value.slice(0, index),
      ...this.props.value.slice(index + 1)
    ]))
  }

  update = index => value => {
    this.props.onChange([
      ...this.props.value.slice(0, index),
      value,
      ...this.props.value.slice(index + 1)
    ])
  }

  render () {
    return (
      <FormGroup>
        <label>{this.props.children}</label>
        <ul>
          {this.props.value.map((item, index) =>
            <li key={index} >
              <TextInput
                id={`${this.props.id}-${index}`}
                value={item}
                onChange={this.update(index)} />
              <Button onClick={this.delete(index)}>Delete</Button>
            </li>
          )}
          <li><Button onClick={this.add}>Add</Button></li>
        </ul>
      </FormGroup>
    )
  }
}

export default ListInput
