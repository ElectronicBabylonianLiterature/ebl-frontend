import React from 'react'
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

function listController (ListView) {
  return ({ value, children, onChange, defaultValue, ...props }) => {
    const add = () => {
      const newItem = createDefaultValue(defaultValue)
      onChange(merge(value, [newItem]))
    }

    const delete_ = index => () => {
      onChange(remove(value, index))
    }

    const update = index => updated => {
      onChange(set(value, index, updated))
    }

    return (
      <div className='List'>
        <ListView
          {...props}
          onDelete={delete_}
          onAdd={add}
          elements={value.map((item, index) =>
            children(item, update(index), index)
          )}
        />
      </div>
    )
  }
}

function CardListView ({
  label,
  noun,
  elements,
  ordered,
  collapsed,
  onAdd,
  onDelete
}) {
  const fullLabel = label && (
    <>
      {label} <SizeBadge collection={elements} />
    </>
  )
  return (
    <CollapsibleCard label={fullLabel} collapsed={collapsed}>
      <ListGroup as={ordered ? 'ol' : 'ul'} variant='flush'>
        {elements.map((element, index) => (
          <ListGroup.Item as='li' key={index}>
            {element}
            <Button
              onClick={onDelete(index)}
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

export default listController(CardListView)
