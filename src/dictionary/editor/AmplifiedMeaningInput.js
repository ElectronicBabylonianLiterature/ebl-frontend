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

  textInput = ({property, children}) => (
    <TextInput
      id={`${this.props.id}-${property}`}
      value={this.props.value[property]}
      onChange={this.onChange(property)}>
      {children}
    </TextInput>
  )

  render () {
    return (
      <Fragment>
        {!this.props.entry && (
          <this.textInput property='key'>Conjugation/Function</this.textInput>
        )}
        <this.textInput property='meaning'>Meaning</this.textInput>
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
