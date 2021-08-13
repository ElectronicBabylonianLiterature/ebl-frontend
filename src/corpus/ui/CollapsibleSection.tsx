import React, { useState, ReactNode } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import { Collapse } from 'react-bootstrap'

export function CollapsibleSection({
  heading,
  element = 'h3',
  children,
}: {
  heading: ReactNode
  element?: string
  children: ReactNode
}): JSX.Element {
  const [isOpen, setOpen] = useState(false)
  const id = _.uniqueId('collapse-')
  return (
    <section className="text-view__section">
      {React.createElement(
        element,
        {
          className:
            'text-view__section-heading text-view__section-heading--collapse',
          onClick: () => setOpen(!isOpen),
          'aria-controls': id,
        },
        <>
          {heading}{' '}
          <i
            className={classNames({
              'text-view__collapse-indicator': true,
              fas: true,
              'fa-caret-right': !isOpen,
              'fa-caret-down': isOpen,
            })}
            aria-expanded={isOpen}
          ></i>
        </>
      )}
      <Collapse in={isOpen} mountOnEnter={true}>
        <div id={id}>{children}</div>
      </Collapse>
    </section>
  )
}
