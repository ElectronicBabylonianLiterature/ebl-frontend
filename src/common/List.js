import React, { Component } from 'react'
import { Button, ListGroup, Card, Collapse, Badge } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'
import { set, remove, merge, isValueObject, isCollection } from 'immutable'

import './List.css'

class List extends Component {
  constructor (props) {
    super(props)
    this.state = {
      open: !this.props.collapsed
    }
  }

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
    const collapseId = _.uniqueId('List-collapse-')
    const size = isCollection(this.props.value)
      ? this.props.value.count()
      : this.props.value.length
    return (
      <div className='List'>
        <Card border='light'>
          {this.props.label && <Card.Header>
            <span className='List__toggle' onClick={() => this.setState({ open: !this.state.open })}
              aria-controls={collapseId}
              aria-expanded={this.state.open}>
              {this.props.label}
              {' '}
              {size > 0 && <Badge variant='light' pill>{size}</Badge>}
              {' '}
              <i className={classNames({
                'fas': true,
                'fa-angle-up': this.state.open,
                'fa-angle-down': !this.state.open
              })} />
            </span>
          </Card.Header>}
          <Collapse in={this.state.open}>
            <div id={collapseId}>
              <ListGroup as={this.props.ordered ? 'ol' : 'ul'} variant='flush'>
                {React.Children.map(this.props.children, child =>
                  <ListGroup.Item as='li' key={child.key}>
                    {React.cloneElement(child, { onChange: this.update(Number(child.key)) })}
                    <Button onClick={this.delete(Number(child.key))} size='sm' variant='outline-secondary'>Delete {this.props.noun}</Button>
                  </ListGroup.Item>
                )}
              </ListGroup>
              <Card.Body>
                <Button onClick={this.add} size='sm' variant='outline-secondary'>
                  Add {this.props.noun}
                </Button>
              </Card.Body>
            </div>
          </Collapse>
        </Card>
      </div>
    )
  }
}

export default List
