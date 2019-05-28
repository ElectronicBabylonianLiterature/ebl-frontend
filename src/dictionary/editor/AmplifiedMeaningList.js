import React, { Component } from 'react'
import List from 'common/List'
import { FormGroup } from 'react-bootstrap'

import AmplifiedMeaningInput from './AmplifiedMeaningInput'

class AmplifiedMeaningList extends Component {
  get noun () {
    return this.props.entry ? 'entry' : 'amplified meaning'
  }

  get defaultValue () {
    return this.props.entry
      ? { meaning: '', vowels: [] }
      : { key: '', meaning: '', vowels: [], entries: [] }
  }

  render () {
    return (
      <FormGroup>
        <List
          label={this.props.children}
          value={this.props.value}
          onChange={this.props.onChange}
          noun={this.noun}
          default={this.defaultValue}
          ordered={this.props.entry}
        >
          {this.props.value.map((entry, index) => (
            <AmplifiedMeaningInput
              key={index}
              id={`${this.props.id}-${index}`}
              value={entry}
              entry={this.props.entry}
            />
          ))}
        </List>
      </FormGroup>
    )
  }
}

export default AmplifiedMeaningList
