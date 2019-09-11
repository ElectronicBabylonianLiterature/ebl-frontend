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

function Fragmentarium({
  number,
  transliteration,
  fragmentService,
  fragmentSearchService
}) {
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
                    fragmentSearchService={fragmentSearchService}
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
                  <LatestTransliterations
                    fragmentSearchService={fragmentSearchService}
                  />
                </Col>
              </Row>
            )}
            {session.isAllowedToTransliterateFragments() && (
              <Row>
                <Col>
                  <NeedsRevision
                    fragmentSearchService={fragmentSearchService}
                  />
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
