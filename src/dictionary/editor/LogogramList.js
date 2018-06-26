import React, { Component } from 'react'
import { FormGroup, Button } from 'react-bootstrap'
import _ from 'lodash'

import ListInput from './ListInput'
import ArrayInput from './ArrayInput'

class LogogramList extends Component {
  add = () => {
    this.props.onChange([...this.props.value, {logogram: [], notes: []}])
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
          {_.map(this.props.value, (logogram, index) =>
            <li key={index}>
              <ArrayInput
                id={`${this.props.id}-${index}`}
                separator=' '
                value={logogram.logogram}
                onChange={this.update(index, 'logogram')}>
                Logogram
              </ArrayInput>
              <ListInput id={`${this.props.id}-${index}-notes`} value={logogram.notes} onChange={this.update(index, 'notes')}>
                Notes
              </ListInput>
              <Button onClick={this.delete(index)}>Delete Logogram</Button>
            </li>
          )}
          <li><Button onClick={this.add}>Add Logogram</Button></li>
        </ul>
      </FormGroup>
    )
  }
}

export default LogogramList
