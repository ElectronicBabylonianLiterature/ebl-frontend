import React, { Component, Fragment } from 'react'

import VowelsList from './VowelsList'
import TextInput from './TextInput'
import AmplifiedMeaningList from './AmplifiedMeaningList'

class AmplifiedMeaningInput extends Component {
  onChange = key => value => {
    this.props.onChange({
      ...this.props.value,
      [key]: value
    })
  }

  render () {
    return (
      <Fragment>
        {!this.props.entry && (
          <TextInput
            id={`${this.props.id}-key`}
            value={this.props.value.key}
            onChange={this.onChange('key')}>
            Conjugation/Function
          </TextInput>
        )}
        <TextInput
          id={`${this.props.id}-meaning`}
          value={this.props.value.meaning}
          onChange={this.onChange('meaning')}>
          Meaning
        </TextInput>
        <VowelsList
          id={`${this.props.id}-vowels`}
          value={this.props.value.vowels}
          onChange={this.onChange('vowels')}>
            Vowels
        </VowelsList>
        {!this.props.entry && (
          <AmplifiedMeaningList
            id={`${this.props.id}-entry`}
            value={this.props.value.entries}
            onChange={this.onChange('entries')}
            entry>
            Entries
          </AmplifiedMeaningList>
        )}
      </Fragment>
    )
  }
}

export default AmplifiedMeaningInput
