import React, { Component, Fragment } from 'react'

import VowelsList from './VowelsList'
import TextInput from './TextInput'

class EntryInput extends Component {
  onChange = key => value => {
    this.props.onChange({
      ...this.props.value,
      [key]: value
    })
  }

  render () {
    return (
      <Fragment>
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

export default EntryInput
