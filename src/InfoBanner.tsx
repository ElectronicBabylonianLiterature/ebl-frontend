import React, { useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import './Header.css'
import { Container } from 'react-bootstrap'
import { set as setCookie, get as getCookie } from 'es-cookie'
import ExternalLink from 'common/ExternalLink'

function InfoBanner(): JSX.Element | null {
  const key = 'eblShowUpdateBanner'
  const initialState = getCookie(key) !== 'false'
  const [show, setShow] = useState(initialState)

  const midnight = new Date()
  midnight.setHours(23, 59, 59)

  return show ? (
    <Container fluid className="Header__info-banner">
      <Alert
        variant="primary"
        onClose={() => {
          setShow(false)
          setCookie(key, 'false', { expires: midnight })
        }}
        dismissible
      >
        <strong>Update:</strong> On Monday, July 15, the eBL servers were
        successfully migrated to new infrastructure. From now on, eBL can be
        accessed either from{' '}
        <ExternalLink href="https://www.ebl.lmu.de">
          https://www.ebl.lmu.de
        </ExternalLink>{' '}
        or{' '}
        <ExternalLink href="https://www.ebl.badw.de">
          https://www.ebl.badw.de
        </ExternalLink>
        . Please note that it will not be possible to login at www.ebl.lmu.de
        until July 16, but you can already access eBL via the new url at
        <ExternalLink href="https://www.ebl.badw.de">
          https://www.ebl.badw.de
        </ExternalLink>
        .
      </Alert>
    </Container>
  ) : null
}

export default InfoBanner
