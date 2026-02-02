import React from 'react'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import FullCitation from './FullCitation'
import Reference from 'bibliography/domain/Reference'

import './referencePopover.css'

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
        <span className="reference-popover__citation">
          <Component {...props} />
        </span>
      </OverlayTrigger>
    )
  }
}
