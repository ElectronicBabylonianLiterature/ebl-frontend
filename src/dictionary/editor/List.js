import React, { Component, Fragment } from 'react'
import { FormGroup, Button } from 'react-bootstrap'
import _ from 'lodash'

class List extends Component {
  add = () => {
    const newItem = _.isObjectLike(this.props.default) ? _.cloneDeep(this.props.default) : this.props.default
    this.props.onChange([...this.props.value, newItem])
  }

  delete = index => () => {
    this.props.onChange([
      ...this.props.value.slice(0, index),
      ...this.props.value.slice(index + 1)
    ])
  }

  update = index => updated => {
    this.props.onChange([
      ...this.props.value.slice(0, index),
      updated,
      ...this.props.value.slice(index + 1)
    ])
  }

  render () {
    return (
      <FormGroup>
        <label>{this.props.label}</label>
        {React.createElement(this.props.ordered ? 'ol' : 'ul', {},
          <Fragment>
            {React.Children.map(this.props.children, child =>
              <li key={child.key}>
                {React.cloneElement(child, { onChange: this.update(child.key) })}
                <Button onClick={this.delete(child.key)}>Delete {this.props.noun}</Button>
              </li>
            )}
            <li><Button onClick={this.add}>Add {this.props.noun}</Button></li>
          </Fragment>
        )}
      </FormGroup>
    )
  }
}

export default List
