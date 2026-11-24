import React from 'react'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import FullCitation from 'bibliography/ui/FullCitation'
import Reference from 'bibliography/domain/Reference'

import 'bibliography/ui/referencePopover.css'

const activationKeys = ['Enter', ' ']

function openOnActivationKey(event: React.KeyboardEvent<HTMLElement>): void {
  if (activationKeys.includes(event.key)) {
    event.preventDefault()
    event.currentTarget.click()
  }
}

export default function referencePopover<P extends { reference: Reference }>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  return function ReferencePopOver(props: P): JSX.Element {
    const popover = (
      <Popover
        id={_.uniqueId('ReferencePopOver-')}
        className="reference-popover__popover"
      >
        <Popover.Body>
          <FullCitation reference={props.reference} />
        </Popover.Body>
      </Popover>
    )
    return (
      <OverlayTrigger
        rootClose
        overlay={popover}
        trigger={['click']}
        placement="right"
      >
        <span
          className="reference-popover__citation"
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          onKeyDown={openOnActivationKey}
        >
          <Component {...props} />
        </span>
      </OverlayTrigger>
    )
  }
}
