import React, { Component } from 'react'
import { FormGroup, Button } from 'react-bootstrap'

import ListInput from './ListInput'
import TextInput from './TextInput'

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

  updateVowels = index => vowels => {
    this.update(index, {...this.props.value[index], value: vowels.split('/')})
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
              <TextInput
                id={`${this.props.id}-${index}-value`}
                value={vowel.value.join('/')}
                onChange={this.updateVowels(index)}>
                Value
              </TextInput>
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
