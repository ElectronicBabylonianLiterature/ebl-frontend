import React, { Component, Fragment } from 'react'
import _ from 'lodash'

import TextListInput from './TextListInput'
import ArrayInput from 'common/ArrayInput'

class ArrayWithNotes extends Component {
  update = property => value => {
    this.props.onChange({ ...this.props.value, [property]: value })
  }

  render () {
    return (
      <Fragment>
        <ArrayInput
          separator={this.props.separator}
          value={this.props.value[this.props.property]}
          onChange={this.update(this.props.property)}
        >
          {_.startCase(this.props.noun)}
        </ArrayInput>
        <TextListInput
          id={`${this.props.id}-notes`}
          value={this.props.value.notes}
          onChange={this.update('notes')}
        >
          Notes
        </TextListInput>
      </Fragment>
    )
  }
}

export default ArrayWithNotes
