import React, { useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import './Header.css'
import { Container } from 'react-bootstrap'

function AlertDismissibleExample(): JSX.Element | null {
  const [show, setShow] = useState(true)

  return show ? (
    <Container fluid className="Header__info-banner">
      <Alert variant="warning" onClose={() => setShow(false)} dismissible>
        <strong>Scheduled Maintenance Notice:</strong> Our servers will be
        undergoing planned maintenance on{' '}
        <strong>
          Saturday, July 20th, from 10:00 AM to 6:00 PM (CEST, UTC +2)
        </strong>
        . During this period, eBL will be temporarily unavailable. We apologize
        for any inconvenience.
      </Alert>
    </Container>
  ) : null
}

export default AlertDismissibleExample
