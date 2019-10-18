import React, { Component } from 'react'
import { FormGroup } from 'react-bootstrap'

import ArrayWithNotes from './ArrayWithNotes'
import List from 'common/List'

class ArrayWithNotesList extends Component {
  render() {
    return (
      <FormGroup>
        <List
          label={this.props.children}
          value={this.props.value}
          onChange={this.props.onChange}
          noun={this.props.noun}
          defaultValue={{ [this.props.property]: [], notes: [] }}
        >
          {(item, onChange) => (
            <ArrayWithNotes
              onChange={onChange}
              noun={this.props.noun}
              property={this.props.property}
              separator={this.props.separator}
              value={item}
            />
          )}
        </List>
      </FormGroup>
    )
  }
}

export default ArrayWithNotesList
