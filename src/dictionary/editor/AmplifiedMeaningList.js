import React, { Component } from 'react'
import { FormGroup, Button } from 'react-bootstrap'

import AmplifiedMeaningInput from './AmplifiedMeaningInput'

class AmplifiedMeaningList extends Component {
  add = () => {
    this.props.onChange([...this.props.value, {meaning: '', vowels: []}])
  }

  delete = index => () => {
    this.props.onChange([
      ...this.props.value.slice(0, index),
      ...this.props.value.slice(index + 1)
    ])
  }

  update = index => entry => {
    this.props.onChange([
      ...this.props.value.slice(0, index),
      entry,
      ...this.props.value.slice(index + 1)
    ])
  }

  render () {
    return (
      <FormGroup>
        <label>{this.props.children}</label>
        <ol>
          {this.props.value.map((entry, index) =>
            <li key={index}>
              <AmplifiedMeaningInput
                id={`${this.props.id}-${index}`}
                value={entry}
                onChange={this.update(index)}
                entry />
              <Button onClick={this.delete(index)}>Delete entry</Button>
            </li>
          )}
          <li><Button onClick={this.add}>Add entry</Button></li>
        </ol>
      </FormGroup>
    )
  }
}

export default AmplifiedMeaningList
