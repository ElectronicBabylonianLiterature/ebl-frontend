import React from 'react'
import AppContent from 'common/AppContent'
import { ResearchProjects } from 'research-projects/researchProject'
import { TextCrumb } from 'common/Breadcrumbs'
import { Container } from 'react-bootstrap'
import SearchForm, { SearchFormProps } from 'fragmentarium/ui/SearchForm'

export default function CaicPage({
  fragmentService,
  fragmentSearchService,
  bibliographyService,
  wordService,
}: Pick<
  SearchFormProps,
  | 'fragmentService'
  | 'fragmentSearchService'
  | 'bibliographyService'
  | 'wordService'
>): JSX.Element {
  return (
    <AppContent
      title={ResearchProjects.CAIC.name}
      crumbs={[
        new TextCrumb('Projects'),
        new TextCrumb(ResearchProjects.CAIC.abbreviation),
      ]}
    >
      <Container fluid>
        <h3>Introduction</h3>
        <p>
          The cuneiform artifacts of the Iraq Museum in Baghdad are a central
          part of the cultural heritage of Mesopotamia, which is of great
          importance to all of humanity. As an interdisciplinary academic
          project, the aim of CAIC is to document, edit, and analyze
          approximately 17,000 cuneiform tablets both from historical and
          linguistic perspectives. With the help of the latest digital
          approaches it will also make them available online to the general
          public and experts from various disciplines.
        </p>
        <h3>Search CAIC Texts</h3>
        <SearchForm
          fragmentSearchService={fragmentSearchService}
          fragmentService={fragmentService}
          wordService={wordService}
          bibliographyService={bibliographyService}
          project={'CAIC'}
        />
      </Container>
    </AppContent>
  )
}
