import React, { Component } from 'react'
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap'
import _ from 'lodash'

import ListInput from './ListInput'

class LogogramList extends Component {
  add = () => {
    this.props.onChange([...this.props.value, {logogram: [], notes: []}])
  }

  delete = index => () => {
    this.props.onChange(_.reject(this.props.value, (item, itemIndex) => index === itemIndex))
  }

  updateLogogram = index => event => {
    this.props.onChange(
      _.map(this.props.value, (item, itemIndex) => index === itemIndex
        ? {...item, logogram: event.target.value.split(' ')}
        : item
      )
    )
  }

  updateNotes = index => notes => {
    this.props.onChange(
      _.map(this.props.value, (item, itemIndex) => index === itemIndex
        ? {...item, notes: notes}
        : item
      )
    )
  }

  render () {
    return (
      <FormGroup>
        <label>{this.props.children}</label>
        <ul>
          {_.map(this.props.value, (logogram, index) =>
            <li key={index}>
              <FormGroup controlId={`${this.props.id}-${index}`}>
                <ControlLabel>Logogram</ControlLabel>
                <FormControl type='text' value={logogram.logogram.join(' ')} onChange={this.updateLogogram(index)} />
              </FormGroup>
              <ListInput id={`${this.props.id}-${index}-notes`} value={logogram.notes} onChange={this.updateNotes(index)}>
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
