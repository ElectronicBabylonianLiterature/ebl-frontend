import React, { Component, Fragment, ReactNode } from 'react'

import ArrayWithNotesList from './ArrayWithNotesList'
import TextInput from './TextInput'
import AmplifiedMeaningList from './AmplifiedMeaningList'

class AmplifiedMeaningInput extends Component<{ value; onChange; entry }> {
  onChange =
    (key: string) =>
    (value): void => {
      this.props.onChange({
        ...this.props.value,
        [key]: value,
      })
    }

  textInput = ({
    property,
    children,
  }: {
    property: string
    children: ReactNode
  }): JSX.Element => (
    <TextInput
      value={this.props.value[property]}
      onChange={this.onChange(property)}
    >
      {children}
    </TextInput>
  )

  render(): JSX.Element {
    return (
      <Fragment>
        {!this.props.entry && (
          <this.textInput property="key">Conjugation/Function</this.textInput>
        )}
        <this.textInput property="meaning">Meaning</this.textInput>
        <ArrayWithNotesList
          value={this.props.value.vowels}
          property="value"
          noun="vowels"
          separator="/"
          onChange={this.onChange('vowels')}
        />
        {!this.props.entry && (
          <AmplifiedMeaningList
            value={this.props.value.entries}
            onChange={this.onChange('entries')}
            entry
          >
            Entries
          </AmplifiedMeaningList>
        )}
      </Fragment>
    )
  }
}

export default AmplifiedMeaningInput
