import React, { Suspense } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import Statistics from './Statistics'
import ApiImage from 'common/ApiImage'
import SessionContext from 'auth/SessionContext'
import SearchForm, { SearchFormProps } from 'fragmentarium/ui/SearchForm'
import Spinner from 'common/Spinner'
import 'fragmentarium/ui/front-page/Fragmentarium.css'
import { Session } from 'auth/Session'
import { SectionCrumb } from 'common/Breadcrumbs'

const LatestTransliterations = React.lazy(
  () => import('./LatestTransliterations'),
)
const NeedsRevision = React.lazy(() => import('./NeedsRevision'))

function Fragmentarium({
  fragmentService,
  bibliographyService,
  fragmentSearchService,
  dossiersService,
  wordService,
}: Pick<
  SearchFormProps,
  | 'fragmentService'
  | 'dossiersService'
  | 'fragmentSearchService'
  | 'bibliographyService'
  | 'wordService'
>): JSX.Element {
  return (
    <AppContent crumbs={[new SectionCrumb('Library')]}>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element => (
          <Container fluid>
            <Row>
              <Col>
                {session.isAllowedToReadFragments() ? (
                  <SearchForm
                    fragmentSearchService={fragmentSearchService}
                    fragmentService={fragmentService}
                    dossiersService={dossiersService}
                    bibliographyService={bibliographyService}
                    wordService={wordService}
                  />
                ) : (
                  <p> Please log in to browse the Library. </p>
                )}
                <Statistics fragmentService={fragmentService} />
              </Col>
              {
                <Col md={6}>
                  <ApiImage fileName="Babel_Project_01_cropped.svg" />
                </Col>
              }
            </Row>
            {session.isAllowedToReadFragments() && (
              <Suspense fallback={<Spinner />}>
                <Row>
                  <Col>
                    <LatestTransliterations
                      fragmentService={fragmentService}
                      dossiersService={dossiersService}
                    />
                  </Col>
                </Row>
              </Suspense>
            )}
            {session.isAllowedToTransliterateFragments() && (
              <Suspense fallback={<Spinner />}>
                <Row>
                  <Col>
                    <NeedsRevision
                      fragmentSearchService={fragmentSearchService}
                    />
                  </Col>
                </Row>
              </Suspense>
            )}
          </Container>
        )}
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default Fragmentarium
