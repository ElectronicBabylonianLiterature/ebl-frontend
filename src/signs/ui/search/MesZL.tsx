import { Button, Overlay, Popover } from 'react-bootstrap'
import _ from 'lodash'
import React, { useRef, useState } from 'react'
import './Signs.css'
import MesZlContent from 'signs/ui/search/MesZLContent'
import { SignListRecord } from 'signs/domain/Sign'

export default function MesZL({
  mesZl,
  mesZlRecords,
}: {
  mesZl: string
  mesZlRecords: SignListRecord[]
}): JSX.Element | null {
  const [show, setShow] = useState(false)
  const target = useRef(null)

  return (
    <>
      <Button
        variant="outline-dark"
        size="sm"
        ref={target}
        onClick={() => setShow(!show)}
      >
        <span className="ReferenceList__citation">
          {mesZlRecords
            .map((record) => `${record.name} ${record.number}`)
            .join(', ')}
        </span>
      </Button>
      <Overlay
        flip={true}
        target={target.current}
        show={show}
        placement={'auto'}
      >
        {(props) => (
          <Popover
            id={_.uniqueId('Citation-')}
            className="ReferenceList__popover MesZL--popover"
            {...props}
          >
            <Popover.Content>
              <MesZlContent mesZl={mesZl} />
            </Popover.Content>
          </Popover>
        )}
      </Overlay>
    </>
  )
}
