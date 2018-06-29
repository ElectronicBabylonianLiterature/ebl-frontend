import React, { Component } from 'react'
import { FormGroup } from 'react-bootstrap'
import _ from 'lodash'

import ArrayWithNotes from './ArrayWithNotes'
import List from './List'

class ArrayWithNotesList extends Component {
  render () {
    return (
      <FormGroup>
        <List
          label={this.props.children}
          value={this.props.value}
          onChange={this.props.onChange}
          noun={this.props.noun}
          default={{[this.props.property]: [], notes: []}}>
          {_.map(this.props.value, (item, index) =>
            <ArrayWithNotes
              key={index}
              noun={this.props.noun}
              id={`${this.props.id}-${index}`}
              property={this.props.property}
              separator={this.props.separator}
              value={item} />
          )}
        </List>
      </FormGroup>
    )
  }
}

export default ArrayWithNotesList
