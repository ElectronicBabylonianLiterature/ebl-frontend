/* eslint-disable react/prop-types */
import React, { ReactNode } from 'react'
import { Badge, Button, Card, ListGroup } from 'react-bootstrap'
import _ from 'lodash'

import './List.css'
import { CollapsibleCard } from './CollabsibleCard'
import { produce } from 'immer'

function SizeBadge({
  collection,
}: {
  collection: unknown[]
}): JSX.Element | null {
  const size = collection.length
  return size > 0 ? (
    <Badge bg="light" pill>
      {size}
    </Badge>
  ) : null
}

function createDefaultValue(defaultValue) {
  if (_.isFunction(defaultValue)) {
    return defaultValue()
  } else if (_.isObjectLike(defaultValue)) {
    return _.cloneDeep(defaultValue)
  } else {
    return defaultValue
  }
}

function listController(ListView) {
  return function ListController({
    value,
    children,
    onChange,
    defaultValue,
    ...props
  }) {
    const add = (): void => {
      const newItem = createDefaultValue(defaultValue)
      onChange(
        produce(value, (draft) => {
          draft.push(newItem)
        }),
      )
    }

    const delete_ = (index) => () => {
      onChange(
        produce(value, (draft) => {
          draft.splice(index, 1)
        }),
      )
    }

    const update = (index) => (updated) => {
      onChange(
        produce(value, (draft) => {
          draft[index] = updated
        }),
      )
    }

    const elements = value.map((item, index) =>
      children(item, update(index), index),
    ) as ReactNode[]

    return (
      <div className="List">
        <ListView
          {...props}
          onDelete={delete_}
          onAdd={add}
          elements={elements}
        />
      </div>
    )
  }
}

function CardListView({
  label,
  noun,
  elements,
  ordered,
  collapsed,
  onAdd,
  onDelete,
}: {
  label: ReactNode
  noun: string
  elements: ReactNode[]
  ordered: boolean
  collapsed: boolean
  onAdd: () => void
  onDelete: (index: number) => () => void
}) {
  const fullLabel = !_.isNil(label) ? (
    <>
      {label} <SizeBadge collection={elements} />
    </>
  ) : null
  return (
    <CollapsibleCard label={fullLabel} collapsed={collapsed}>
      <ListGroup as={ordered ? 'ol' : 'ul'} variant="flush">
        {elements.map((element, index) => (
          <ListGroup.Item as="li" key={index}>
            {element}
            <Button
              onClick={onDelete(index)}
              size="sm"
              variant="outline-secondary"
            >
              Delete {noun}
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Card.Body>
        <Button onClick={onAdd} size="sm" variant="outline-secondary">
          Add {noun}
        </Button>
      </Card.Body>
    </CollapsibleCard>
  )
}

export default listController(CardListView)
