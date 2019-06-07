import React, { Component } from 'react'
import { FormGroup } from 'react-bootstrap'

import FormList from './FormList'
import List from 'common/List'

class DerivedList extends Component {
  render() {
    return (
      <FormGroup>
        <List
          label={this.props.children}
          value={this.props.value}
          onChange={this.props.onChange}
          noun="group"
          defaultValue={[]}
        >
          {(group, onChange, groupIndex) => (
            <FormList
              onChange={onChange}
              value={group}
              fields={['lemma', 'homonym', 'notes']}
            >
              {groupIndex + 1}. group
            </FormList>
          )}
        </List>
      </FormGroup>
    )
  }
}

export default DerivedList
