import React, { useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import Statistics from './Statistics'
import ApiImage from 'common/ApiImage'
import SessionContext from 'auth/SessionContext'
import SearchForm, { SearchFormProps, State } from 'fragmentarium/ui/SearchForm'
import LatestTransliterations from './LatestTransliterations'
import NeedsRevision from './NeedsRevision'
import AdvancedSearchFields from 'fragmentarium/ui/SearchFormAdvanced'
import { Session } from 'auth/Session'
import { SectionCrumb } from 'common/Breadcrumbs'

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
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [formState, setFormState] = useState<State>({
    number: null,
    referenceEntry: { id: '', label: '' },
    pages: null,
    lemmas: null,
    lemmaOperator: 'line',
    transliteration: null,
    scriptPeriod: '',
    scriptPeriodModifier: '',
    genre: null,
    project: null,
    isValid: true,
    site: null,
    museum: null,
    activeKey: undefined,
  })

  return (
    <AppContent crumbs={[new SectionCrumb('Library')]}>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element => (
          <Container fluid>
            <Row>
              <Col md={6}>
                {session.isAllowedToReadFragments() ? (
                  <SearchForm
                    fragmentSearchService={fragmentSearchService}
                    fragmentService={fragmentService}
                    dossiersService={dossiersService}
                    bibliographyService={bibliographyService}
                    wordService={wordService}
                    formState={formState}
                    onFormStateChange={setFormState}
                    onToggleAdvancedSearch={() =>
                      setShowAdvancedSearch(!showAdvancedSearch)
                    }
                  />
                ) : (
                  <p>Please log in to browse the Library.</p>
                )}
                <Statistics fragmentService={fragmentService} />
              </Col>
              <Col md={6}>
                {showAdvancedSearch ? (
                  <AdvancedSearchFields
                    formState={formState}
                    onChange={(name) => (value) =>
                      setFormState((prev) => ({ ...prev, [name]: value }))}
                    fragmentService={fragmentService}
                  />
                ) : (
                  <ApiImage fileName="Babel_Project_01_cropped.svg" />
                )}
              </Col>
            </Row>
            {session.isAllowedToReadFragments() && (
              <Row>
                <Col>
                  <LatestTransliterations
                    fragmentService={fragmentService}
                    dossiersService={dossiersService}
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
