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

function createDefaultValue(defaultValue: unknown | (() => unknown)): unknown {
  if (_.isFunction(defaultValue)) {
    return defaultValue()
  } else if (_.isObjectLike(defaultValue)) {
    return _.cloneDeep(defaultValue)
  } else {
    return defaultValue
  }
}

type ListViewProps = {
  label?: ReactNode
  noun?: string
  elements: ReactNode[]
  ordered?: boolean
  collapsed?: boolean
  onAdd: () => void
  onDelete: (index: number) => () => void
}

type ListControllerProps<T> = {
  value: readonly T[]
  children: (
    item: T,
    onChange: (updated: unknown) => void,
    index: number,
  ) => ReactNode
  onChange: ((value: T[]) => void) | ((value: T) => void)
  defaultValue: unknown | (() => unknown)
  label?: ReactNode
  noun?: string
  ordered?: boolean
  collapsed?: boolean
  [key: string]: unknown
}

function listController(ListView: React.ComponentType<ListViewProps>) {
  return function ListController<T>({
    value,
    children,
    onChange,
    defaultValue,
    ...props
  }: ListControllerProps<T>): JSX.Element {
    const add = (): void => {
      const newItem = createDefaultValue(defaultValue) as T
      ;(onChange as (value: T[]) => void)(
        produce(value as T[], (draft: T[]) => {
          draft.push(newItem)
        }),
      )
    }

    const delete_ = (index: number) => (): void => {
      ;(onChange as (value: T[]) => void)(
        produce(value as T[], (draft: T[]) => {
          draft.splice(index, 1)
        }),
      )
    }

    const update =
      (index: number) =>
      (updated: unknown): void => {
        ;(onChange as (value: T[]) => void)(
          produce(value as T[], (draft: T[]) => {
            draft[index] = updated as T
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
}: ListViewProps): JSX.Element {
  const nounSuffix = noun ? ` ${noun}` : ''
  const fullLabel = !_.isNil(label) ? (
    <>
      {label} <SizeBadge collection={elements} />
    </>
  ) : null
  return (
    <CollapsibleCard label={fullLabel} collapsed={Boolean(collapsed)}>
      <ListGroup as={ordered ? 'ol' : 'ul'} variant="flush">
        {elements.map((element, index) => (
          <ListGroup.Item as="li" key={index}>
            {element}
            <Button
              onClick={onDelete(index)}
              size="sm"
              variant="outline-secondary"
            >
              Delete{nounSuffix}
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Card.Body>
        <Button onClick={onAdd} size="sm" variant="outline-secondary">
          Add{nounSuffix}
        </Button>
      </Card.Body>
    </CollapsibleCard>
  )
}

export default listController(CardListView)
