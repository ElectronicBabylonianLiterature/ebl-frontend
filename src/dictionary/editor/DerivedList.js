import React, { Component } from 'react'
import { FormGroup, Button } from 'react-bootstrap'
import _ from 'lodash'

import FormList from './FormList'

class DerivedList extends Component {
  addDerived = () => this.props.onChange([...this.props.value, []])

  deleteDerived = index => () => {
    this.props.onChange([
      ...this.props.value.slice(0, index),
      ...this.props.value.slice(index + 1)
    ])
  }

  updateDerived = index => group => {
    this.props.onChange([
      ...this.props.value.slice(0, index),
      group,
      ...this.props.value.slice(index + 1)
    ])
  }

  render () {
    return (
      <FormGroup>
        <label>{this.props.children}</label>
        <ul>
          {this.props.value.map((group, groupIndex) =>
            <li key={groupIndex}>
              <FormList
                id={`${this.props.id}-${groupIndex}`}
                value={group}
                onChange={this.updateDerived(groupIndex)}
                fields={['lemma', 'homonym', 'notes']}>{groupIndex + 1}. group</FormList>
              <Button onClick={this.deleteDerived(groupIndex)}>Delete group</Button>
            </li>
          )}
          <li><Button onClick={this.addDerived}>Add group</Button></li>
        </ul>
      </FormGroup>
    )
  }
}

export default DerivedList
