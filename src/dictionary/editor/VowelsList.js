import React, { Component } from 'react'
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap'

import ListInput from './ListInput'

class VowelsList extends Component {
  add = () => {
    this.props.onChange([...this.props.value, {value: [], notes: []}])
  }

  delete = index => () => {
    this.props.onChange([
      ...this.props.value.slice(0, index),
      ...this.props.value.slice(index + 1)
    ])
  }

  update = (index, vowels) => {
    this.props.onChange([
      ...this.props.value.slice(0, index),
      vowels,
      ...this.props.value.slice(index + 1)
    ])
  }

  updateVowels = index => event => {
    this.update(index, {...this.props.value[index], value: event.target.value.split('/')})
  }

  updateNotes = index => notes => {
    this.update(index, {...this.props.value[index], notes: notes})
  }

  render () {
    return (
      <FormGroup>
        <label>{this.props.children}</label>
        <ul>
          {this.props.value.map((vowel, index) =>
            <li key={index}>
              <FormGroup controlId={`${this.props.id}-${index}-value`}>
                <ControlLabel>Value</ControlLabel>
                <FormControl type='text' value={vowel.value.join('/')} onChange={this.updateVowels(index)} />
              </FormGroup>
              <ListInput id={`${this.props.id}-${index}-notes`} value={vowel.notes} onChange={this.updateNotes(index)}>
                Notes
              </ListInput>
              <Button onClick={this.delete(index)}>Delete vowels</Button>
            </li>
          )}
          <li><Button onClick={this.add}>Add vowels</Button></li>
        </ul>
      </FormGroup>
    )
  }
}

export default VowelsList
