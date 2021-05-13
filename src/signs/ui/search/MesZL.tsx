import { OverlayTrigger, Popover } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'

export default function MesZL({ mesZl }: { mesZl: string }): JSX.Element {
  const popover = (
    <Popover id={_.uniqueId('Citation-')} className="ReferenceList__popover">
      <Popover.Content>
        <div dangerouslySetInnerHTML={{ __html: mesZl }} />
      </Popover.Content>
    </Popover>
  )
  return (
    <>
      &nbsp;&mdash;&nbsp;
      <OverlayTrigger
        rootClose
        overlay={popover}
        trigger={['hover', 'focus']}
        placement="right"
      >
        <span className="ReferenceList__citation">MesZL</span>
      </OverlayTrigger>
    </>
  )
}
