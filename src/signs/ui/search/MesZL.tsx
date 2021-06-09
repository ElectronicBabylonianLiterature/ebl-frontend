import { Button, OverlayTrigger, Popover } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'
import './Signs.css'
import MesZlContent from 'signs/ui/search/MesZLContent'
import { SignListRecord } from 'signs/domain/Sign'

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
      <Popover.Content>
        <MesZlContent mesZl={mesZl} signName={signName} />
      </Popover.Content>
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
            .map((record) => `${record.name} ${record.number}`)
            .join(', ')}
        </span>
      </Button>
    </OverlayTrigger>
  )
}
