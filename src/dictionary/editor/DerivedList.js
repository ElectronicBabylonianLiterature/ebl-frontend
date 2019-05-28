import React, { Component } from 'react'
import { FormGroup } from 'react-bootstrap'

import FormList from './FormList'
import List from 'common/List'

class DerivedList extends Component {
  render () {
    return (
      <FormGroup>
        <List
          label={this.props.children}
          value={this.props.value}
          onChange={this.props.onChange}
          noun='group'
          default={[]}
        >
          {this.props.value.map((group, groupIndex) => (
            <FormList
              key={groupIndex}
              id={`${this.props.id}-${groupIndex}`}
              value={group}
              fields={['lemma', 'homonym', 'notes']}
            >
              {groupIndex + 1}. group
            </FormList>
          ))}
        </List>
      </FormGroup>
    )
  }
}

export default DerivedList
