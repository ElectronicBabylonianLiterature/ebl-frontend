import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import queryString from 'query-string'
import AppContent from 'common/AppContent'
import Statistics from './Statistics'
import Image from './Image'
import SessionContext from 'auth/SessionContext'
import SearchGroup from './SearchGroup'
import LatestTransliterations from './LatestTransliterations'

import './Fragmentarium.css'

function Fragmentarium ({ location, fragmentService }) {
  const number = queryString.parse(location.search).number
  const transliteration = queryString.parse(location.search).transliteration
  return (
    <AppContent section='Fragmentarium'>
      <Container fluid>
        <Row>
          <Col md={6}>
            <SessionContext.Consumer>
              {session => session.isAllowedToReadFragments()
                ? <SearchGroup number={number} transliteration={transliteration} fragmentService={fragmentService} />
                : <p> Please log in to browse the Fragmentarium. </p>
              }
            </SessionContext.Consumer>
            <Statistics fragmentService={fragmentService} />
          </Col>
          <Col md={6}>
            <Image fragmentService={fragmentService} fileName='Babel_Project_01_cropped.svg' />
          </Col>
        </Row>
        <Row>
          <Col>
            <SessionContext.Consumer>
              {session => session.isAllowedToReadFragments() && <LatestTransliterations fragmentService={fragmentService} />}
            </SessionContext.Consumer>
          </Col>
        </Row>
      </Container>
    </AppContent>
  )
}

export default Fragmentarium
