import React, { useId, useRef, useState } from 'react'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import FullCitation from 'bibliography/ui/FullCitation'
import Reference from 'bibliography/domain/Reference'

import 'bibliography/ui/referencePopover.css'

export default function referencePopover<P extends { reference: Reference }>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  return function ReferencePopOver(props: P): JSX.Element {
    const popoverId = useId()
    const [show, setShow] = useState(false)
    const trigger = useRef<HTMLButtonElement>(null)
    const popover = (
      <Popover
        id={popoverId}
        className="reference-popover__popover"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            trigger.current!.focus()
          }
        }}
      >
        <Popover.Body>
          <FullCitation reference={props.reference} />
        </Popover.Body>
      </Popover>
    )
    return (
      <OverlayTrigger
        rootClose
        show={show}
        onToggle={setShow}
        overlay={popover}
        trigger={['click']}
        placement="right"
      >
        <button
          type="button"
          ref={trigger}
          className="reference-popover__citation"
          aria-expanded={show}
          aria-controls={show ? popoverId : undefined}
        >
          <Component {...props} />
        </button>
      </OverlayTrigger>
    )
  }
}
