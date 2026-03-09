import React, { useState, ReactNode } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import { Collapse } from 'react-bootstrap'

import './CollapsibleSection.sass'

export default function CollapsibleSection({
  heading,
  element = 'h3',
  open = false,
  classNameBlock,
  children,
}: {
  heading: ReactNode
  element?: string
  open?: boolean
  classNameBlock: string
  children: ReactNode
}): JSX.Element {
  const [isOpen, setOpen] = useState(open)
  const id = _.uniqueId('collapse-')
  return (
    <section className={`${classNameBlock}__section`}>
      {React.createElement(
        element,
        {
          className: classNames([
            `${classNameBlock}__section-heading`,
            'collapsible_section__heading',
          ]),
          onClick: () => setOpen(!isOpen),
          'aria-controls': id,
        },
        <>
          {heading}{' '}
          <i
            className={classNames({
              'collapsible_section__collapse-indicator': true,
              fas: true,
              'fa-caret-right': !isOpen,
              'fa-caret-down': isOpen,
            })}
            aria-expanded={isOpen}
          ></i>
        </>,
      )}
      <Collapse in={isOpen} mountOnEnter={true}>
        <div id={id}>{children}</div>
      </Collapse>
    </section>
  )
}
