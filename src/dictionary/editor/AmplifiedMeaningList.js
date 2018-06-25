import React, { Component } from 'react'
import { FormGroup, Button } from 'react-bootstrap'

import AmplifiedMeaningInput from './AmplifiedMeaningInput'

class AmplifiedMeaningList extends Component {
  get noun () {
    return this.props.entry ? 'entry' : 'amplified meaning'
  }

  add = () => {
    const newAmplifiedMeaning = this.props.entry
      ? {meaning: '', vowels: []}
      : {key: '', meaning: '', vowels: [], entries: []}
    this.props.onChange([...this.props.value, newAmplifiedMeaning])
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
                entry={this.props.entry} />
              <Button onClick={this.delete(index)}>Delete {this.noun}</Button>
            </li>
          )}
          <li><Button onClick={this.add}>Add {this.noun}</Button></li>
        </ol>
      </FormGroup>
    )
  }
}

export default AmplifiedMeaningList
