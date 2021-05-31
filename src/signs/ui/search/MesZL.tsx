import { Button, Overlay, Popover } from 'react-bootstrap'
import _ from 'lodash'
import React, { useRef, useState } from 'react'
import './Signs.css'
import MesZlContent from 'signs/ui/search/MesZLContent'

export default function MesZL({
  mesZl,
  mesZlNumber,
}: {
  mesZl: string
  mesZlNumber: string | undefined
}): JSX.Element | null {
  const [show, setShow] = useState(false)
  const target = useRef(null)

  const formattedNumber = mesZlNumber ? ` ${mesZlNumber}` : ''

  return (
    <>
      <Button
        variant="outline-dark"
        size="sm"
        ref={target}
        onClick={() => setShow(!show)}
      >
        <span className="ReferenceList__citation">MesZL{formattedNumber}</span>
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
