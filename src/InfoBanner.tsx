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
        <strong>Scheduled Maintenance Notice:</strong> On{' '}
        <strong>Monday, July 15, 2024, from 10:00 AM to 12:00 PM CEST</strong>,
        the eBL servers will be undergoing scheduled maintenance. During this
        time, you will not be able to log in or make any changes to records. The
        maintenance may also cause temporary service interruptions. Registered
        users will receive an email notification once the maintenance is
        complete.
      </Alert>
    </Container>
  ) : null
}

export default InfoBanner
