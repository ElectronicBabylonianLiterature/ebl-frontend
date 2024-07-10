import React, { useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import './Header.css'
import { Container } from 'react-bootstrap'
import { set as setCookie, get as getCookie } from 'es-cookie'

function InfoBanner(): JSX.Element | null {
  const initialState = getCookie('eblShowInfoBanner') !== 'false'
  const [show, setShow] = useState(initialState)

  const midnight = new Date()
  midnight.setHours(23, 59, 59)

  return show ? (
    <Container fluid className="Header__info-banner">
      <Alert
        variant="warning"
        onClose={() => {
          setShow(false)
          setCookie('eblShowInfoBanner', 'false', { expires: midnight })
        }}
        dismissible
      >
        <strong>Scheduled Maintenance Notice:</strong> Our servers will be
        undergoing planned maintenance on{' '}
        <strong>
          Monday, July 15th, from 10:00 AM to 6:00 PM (CEST, UTC+2)
        </strong>
        . During this period, eBL may be temporarily unavailable. We apologize
        for any inconvenience.
      </Alert>
    </Container>
  ) : null
}

export default InfoBanner
