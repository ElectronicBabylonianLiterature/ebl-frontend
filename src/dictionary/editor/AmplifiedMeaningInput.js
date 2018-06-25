import React, { Component, Fragment } from 'react'

import VowelsList from './VowelsList'
import TextInput from './TextInput'

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
      </Fragment>
    )
  }
}

export default AmplifiedMeaningInput
