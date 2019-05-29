import React, { Component } from 'react'
import { Badge, Button, Card, ListGroup } from 'react-bootstrap'
import _ from 'lodash'
import { isCollection, isValueObject, merge, remove, set } from 'immutable'

import './List.css'
import { CollapsibleCard } from './CollabsibleCard'

function SizeBadge ({ collection }) {
  const size = isCollection(collection) ? collection.count() : collection.length
  return (
    size > 0 && (
      <Badge variant='light' pill>
        {size}
      </Badge>
    )
  )
}

function createDefaultValue (defaultValue) {
  if (_.isFunction(defaultValue)) {
    return defaultValue()
  } else if (_.isObjectLike(defaultValue) && !isValueObject(defaultValue)) {
    return _.cloneDeep(defaultValue)
  } else {
    return defaultValue
  }
}

function CardList ({
  label,
  noun,
  children,
  ordered,
  collapsed,
  value,
  onAdd,
  onDelete,
  onUpdate
}) {
  const fullLabel = label && (
    <>
      {label} <SizeBadge collection={value} />
    </>
  )
  return (
    <CollapsibleCard label={fullLabel} collapsed={collapsed}>
      <ListGroup as={ordered ? 'ol' : 'ul'} variant='flush'>
        {React.Children.map(children, child => (
          <ListGroup.Item as='li' key={child.key}>
            {React.cloneElement(child, {
              onChange: onUpdate(Number(child.key))
            })}
            <Button
              onClick={onDelete(Number(child.key))}
              size='sm'
              variant='outline-secondary'
            >
              Delete {noun}
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Card.Body>
        <Button onClick={onAdd} size='sm' variant='outline-secondary'>
          Add {noun}
        </Button>
      </Card.Body>
    </CollapsibleCard>
  )
}

export default class List extends Component {
  add = () => {
    let newItem = createDefaultValue(this.props.default)
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
      <div className='List'>
        <CardList
          {...this.props}
          onUpdate={this.update}
          onDelete={this.delete}
          onAdd={this.add}
        />
      </div>
    )
  }
}
