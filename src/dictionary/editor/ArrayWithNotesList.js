import React, { Component } from 'react'
import { FormGroup, Button } from 'react-bootstrap'
import _ from 'lodash'

import TextListInput from './TextListInput'
import ArrayInput from './ArrayInput'

class ArrayWithNotesList extends Component {
  add = () => {
    this.props.onChange([...this.props.value, {[this.props.property]: [], notes: []}])
  }

  delete = index => () => {
    this.props.onChange([
      ...this.props.value.slice(0, index),
      ...this.props.value.slice(index + 1)
    ])
  }

  update = (index, property) => value => {
    this.props.onChange([
      ...this.props.value.slice(0, index),
      {...this.props.value[index], [property]: value},
      ...this.props.value.slice(index + 1)
    ])
  }

  render () {
    return (
      <FormGroup>
        <label>{this.props.children}</label>
        <ul>
          {_.map(this.props.value, (item, index) =>
            <li key={index}>
              <ArrayInput
                id={`${this.props.id}-${index}`}
                separator={this.props.separator}
                value={item[this.props.property]}
                onChange={this.update(index, this.props.property)}>
                {_.startCase(this.props.noun)}
              </ArrayInput>
              <TextListInput id={`${this.props.id}-${index}-notes`} value={item.notes} onChange={this.update(index, 'notes')}>
                Notes
              </TextListInput>
              <Button onClick={this.delete(index)}>Delete {this.props.noun}</Button>
            </li>
          )}
          <li><Button onClick={this.add}>Add {this.props.noun}</Button></li>
        </ul>
      </FormGroup>
    )
  }
}

export default ArrayWithNotesList
