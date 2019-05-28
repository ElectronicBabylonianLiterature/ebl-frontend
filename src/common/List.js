import React, { Component } from 'react'
import { Badge, Button, Card, ListGroup } from 'react-bootstrap'
import _ from 'lodash'
import { isCollection, isValueObject, merge, remove, set } from 'immutable'

import './List.css'
import { CollapsibleCard } from './CollabsibleCard'

function SizeBadge ({ collection }) {
  const size = isCollection(collection)
    ? collection.count()
    : collection.length
  return size > 0 && <Badge variant='light' pill>{size}</Badge>
}

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
    const label = this.props.label
      ? <>{this.props.label}{' '}<SizeBadge collection={this.props.value} /></>
      : null
    return (
      <div className='List'>
        <CollapsibleCard
          label={label}
          collapsed={this.props.collapsed}>
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
        </CollapsibleCard>
      </div>
    )
  }
}

export default List
