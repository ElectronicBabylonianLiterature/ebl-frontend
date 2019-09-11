import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import Statistics from './Statistics'
import Image from './Image'
import SessionContext from 'auth/SessionContext'
import SearchGroup from './SearchGroup'
import LatestTransliterations from './LatestTransliterations'
import NeedsRevision from './NeedsRevision'

import './Fragmentarium.css'

function Fragmentarium({ number, transliteration, fragmentService }) {
  return (
    <AppContent crmbs={['Fragmentarium']}>
      <SessionContext.Consumer>
        {session => (
          <Container fluid>
            <Row>
              <Col md={6}>
                {session.isAllowedToReadFragments() ? (
                  <SearchGroup
                    number={number}
                    transliteration={transliteration}
                    fragmentService={fragmentService}
                  />
                ) : (
                  <p> Please log in to browse the Fragmentarium. </p>
                )}
                <Statistics fragmentService={fragmentService} />
              </Col>
              <Col md={6}>
                <Image
                  fragmentService={fragmentService}
                  fileName="Babel_Project_01_cropped.svg"
                />
              </Col>
            </Row>
            {session.isAllowedToReadFragments() && (
              <Row>
                <Col>
                  <LatestTransliterations fragmentService={fragmentService} />
                </Col>
              </Row>
            )}
            {session.isAllowedToTransliterateFragments() && (
              <Row>
                <Col>
                  <NeedsRevision fragmentService={fragmentService} />
                </Col>
              </Row>
            )}
          </Container>
        )}
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default Fragmentarium
