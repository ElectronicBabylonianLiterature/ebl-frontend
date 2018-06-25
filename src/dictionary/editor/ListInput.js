import React, { Component } from 'react'
import { FormGroup, Button } from 'react-bootstrap'
import _ from 'lodash'

import TextInput from './TextInput'

class ListInput extends Component {
  add = () => {
    this.props.onChange([...this.props.value, ''])
  }

  delete = index => () => {
    this.props.onChange(_.reject(this.props.value, (item, itemIndex) => index === itemIndex))
  }

  update = index => value => {
    this.props.onChange(
      _.map(this.props.value, (item, itemIndex) => index === itemIndex
        ? value
        : item
      )
    )
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
