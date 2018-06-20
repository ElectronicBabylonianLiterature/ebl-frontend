import React, { Component } from 'react'
import { FormGroup, FormControl, Button } from 'react-bootstrap'
import _ from 'lodash'

class ListInput extends Component {
  add = () => {
    this.props.onChange([...this.props.value, ''])
  }

  delete = index => () => {
    this.props.onChange(_.reject(this.props.value, (item, itemIndex) => index === itemIndex))
  }

  update = index => event => {
    this.props.onChange(
      _.map(this.props.value, (item, itemIndex) => index === itemIndex
        ? event.target.value
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
              <FormGroup controld={`${this.props.id}-${index}`}>
                <FormControl
                  type='text'
                  value={item}
                  onChange={this.update(index)} />
              </FormGroup>
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
