import React, { Component, Fragment } from 'react'
import { FormGroup, Button } from 'react-bootstrap'
import _ from 'lodash'

import './List.css'

class List extends Component {
  add = () => {
    const newItem = _.isObjectLike(this.props.default) ? _.cloneDeep(this.props.default) : this.props.default
    this.props.onChange([...this.props.value, newItem])
  }

  delete = index => () => {
    this.props.onChange([
      ..._.take(this.props.value, index),
      ..._.drop(this.props.value, index + 1)
    ])
  }

  update = index => updated => {
    this.props.onChange([
      ..._.take(this.props.value, index),
      updated,
      ..._.drop(this.props.value, index + 1)
    ])
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
