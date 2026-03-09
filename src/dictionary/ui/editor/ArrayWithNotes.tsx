import React, { Component } from 'react'
import _ from 'lodash'

import TextListInput from './TextListInput'
import ArrayInput from 'common/ArrayInput'

class ArrayWithNotes extends Component<{
  onChange
  value
  separator
  property
  noun
}> {
  update =
    (property: string) =>
    (value): void => {
      this.props.onChange({ ...this.props.value, [property]: value })
    }

  render(): JSX.Element {
    return (
      <>
        <ArrayInput
          separator={this.props.separator}
          value={this.props.value[this.props.property]}
          onChange={this.update(this.props.property)}
        >
          {_.startCase(this.props.noun)}
        </ArrayInput>
        <TextListInput
          value={this.props.value.notes}
          onChange={this.update('notes')}
        >
          Notes
        </TextListInput>
      </>
    )
  }
}

export default ArrayWithNotes
