import React, { Component, Fragment } from 'react'
import { FormGroup, Button } from 'react-bootstrap'
import _ from 'lodash'
import { set, remove, merge, isValueObject } from 'immutable'

import './List.css'

class List extends Component {
  add = () => {
    const defaultValue = this.props.default
    const newItem = _.isObjectLike(this.props.default) && !isValueObject(defaultValue)
      ? _.cloneDeep(defaultValue)
      : defaultValue
    this.props.onChange(merge(this.props.value, [newItem]))
  }

  delete = index => () => {
    this.props.onChange(remove(this.props.value, index))
  }

  update = index => updated => {
    this.props.onChange(set(this.props.value, index, updated))
  }

  render () {
    return (
      <FormGroup>
        <label>{this.props.label}</label>
        {React.createElement(this.props.ordered ? 'ol' : 'ul', { className: 'List' },
          <Fragment>
            {React.Children.map(this.props.children, child =>
              <li className='List__item' key={child.key}>
                {React.cloneElement(child, { onChange: this.update(Number(child.key)) })}
                <Button onClick={this.delete(Number(child.key))} size='sm' variant='outline-secondary'>Delete {this.props.noun}</Button>
              </li>
            )}
            <li><Button onClick={this.add} size='sm' variant='outline-secondary'>Add {this.props.noun}</Button></li>
          </Fragment>
        )}
      </FormGroup>
    )
  }
}

export default List
