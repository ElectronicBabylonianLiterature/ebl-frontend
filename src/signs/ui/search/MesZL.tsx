import { Button, OverlayTrigger, Popover } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'
import 'signs/ui/search/Signs.sass'
import MesZlContent from 'signs/ui/search/MesZLContent'

export default function MesZL({
  mesZl,
  signName,
  label,
}: {
  signName: string
  mesZl: string
  label: string
}): JSX.Element | null {
  const renderPopover = (props) => (
    <Popover
      id={_.uniqueId('Citation-')}
      className="ReferenceList__popover mesZL__popover"
      {...props}
    >
      <Popover.Body>
        <MesZlContent mesZl={mesZl} signName={signName} cutOff={7} />
      </Popover.Body>
    </Popover>
  )

  return (
    <OverlayTrigger
      flip={true}
      trigger={'click'}
      placement={'auto'}
      rootClose={true}
      overlay={renderPopover}
    >
      <Button variant="link" className="signs__meszl-link">
        {label}
      </Button>
    </OverlayTrigger>
  )
}
