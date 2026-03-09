import { Button, OverlayTrigger, Popover } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'
import './Signs.sass'
import MesZlContent from 'signs/ui/search/MesZLContent'
import { SignListRecord } from 'signs/domain/Sign'
import { getDisplayName } from 'signs/ui/display/SignInformation'

export default function MesZL({
  mesZl,
  mesZlRecords,
  signName,
}: {
  signName: string
  mesZl: string
  mesZlRecords: SignListRecord[]
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
      <Button variant="outline-dark" size="sm">
        <span className="ReferenceList__citation">
          {mesZlRecords
            .map((record) => `${getDisplayName(record.name)} ${record.number}`)
            .join(', ')}
        </span>
      </Button>
    </OverlayTrigger>
  )
}
