import React from 'react'
import AppContent from 'common/AppContent'
import { ResearchProjects } from 'research-projects/researchProject'
import { TextCrumb } from 'common/Breadcrumbs'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import { Container } from 'react-bootstrap'
import SearchForm from 'fragmentarium/ui/SearchForm'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordService from 'dictionary/application/WordService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FragmentQuery } from 'query/FragmentQuery'

interface Props {
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  bibliographyService: BibliographyService
  fragmentQuery: FragmentQuery
  wordService: WordService
}

export default function CaicPage({
  fragmentService,
  fragmentSearchService,
  bibliographyService,
  fragmentQuery,
  wordService,
}: Props): JSX.Element {
  return (
    <AppContent
      title={ResearchProjects.CAIC.name}
      crumbs={[
        new TextCrumb('Projects'),
        new TextCrumb(ResearchProjects.CAIC.abbreviation),
      ]}
    >
      <SessionContext.Consumer>
        {(session: Session): JSX.Element => (
          <Container fluid>
            <p>
              The cuneiform artifacts of the Iraq Museum in Baghdad are a
              central part of the cultural heritage of Mesopotamia, which is of
              great importance to all of humanity. As an interdisciplinary
              academic project, the aim of CAIC is to document, edit, and
              analyze approximately 17,000 cuneiform tablets both from
              historical and linguistic perspectives. With the help of the
              latest digital approaches it will also make them available online
              to the general public and experts from various disciplines.
            </p>
            <SearchForm
              fragmentSearchService={fragmentSearchService}
              fragmentService={fragmentService}
              fragmentQuery={fragmentQuery}
              wordService={wordService}
              bibliographyService={bibliographyService}
              project={'CAIC'}
            />
          </Container>
        )}
      </SessionContext.Consumer>
    </AppContent>
  )
}
