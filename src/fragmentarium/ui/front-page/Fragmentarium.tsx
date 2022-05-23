import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import Statistics from './Statistics'
import ApiImage from 'common/ApiImage'
import SessionContext from 'auth/SessionContext'
import SearchGroup from 'fragmentarium/ui/SearchForm'
import LatestTransliterations from './LatestTransliterations'
import NeedsRevision from './NeedsRevision'

import 'fragmentarium/ui/front-page/Fragmentarium.css'
import { Session } from 'auth/Session'
import { SectionCrumb } from 'common/Breadcrumbs'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'

interface Props {
  number: string | null | undefined
  id: string | null | undefined
  title: string | null | undefined
  primaryAuthor: string | null | undefined
  year: string | null | undefined
  pages: string | null | undefined
  transliteration: string | null | undefined
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
}

function Fragmentarium({
  number,
  title,
  primaryAuthor,
  year,
  id,
  pages,
  transliteration,
  fragmentService,
  fragmentSearchService,
}: Props): JSX.Element {
  return (
    <AppContent crumbs={[new SectionCrumb('Fragmentarium')]}>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element => (
          <Container fluid>
            <Row>
              <Col md={6}>
                {session.isAllowedToReadFragments() ? (
                  <SearchGroup
                    number={number}
                    id={id}
                    primaryAuthor={primaryAuthor}
                    year={year}
                    title={title}
                    pages={pages}
                    transliteration={transliteration}
                    paginationIndex={0}
                    fragmentService={fragmentService}
                    fragmentSearchService={fragmentSearchService}
                  />
                ) : (
                  <p> Please log in to browse the Fragmentarium. </p>
                )}
                <Statistics fragmentService={fragmentService} />
              </Col>
              <Col md={6}>
                <ApiImage fileName="Babel_Project_01_cropped.svg" />
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
