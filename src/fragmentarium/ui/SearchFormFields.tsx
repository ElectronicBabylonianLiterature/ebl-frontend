import React from 'react'
import { Button, ButtonToolbar, Col, Form, Row } from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import WordService from 'dictionary/application/WordService'
import DossiersService from 'dossiers/application/DossiersService'
import { ResearchProjects } from 'research-projects/researchProject'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import FindspotConstraint from 'fragmentarium/ui/FindspotConstraint'
import SearchFormAdvanced from 'fragmentarium/ui/search/SearchFormAdvanced'
import LemmaSearchForm from 'fragmentarium/ui/search/SearchFormLemma'
import NumberSearchForm from 'fragmentarium/ui/search/SearchFormNumber'
import ReferenceSearchForm from 'fragmentarium/ui/search/SearchFormReference'
import TransliterationSearchForm from 'fragmentarium/ui/search/SearchFormTransliteration'
import { helpColSize } from 'fragmentarium/ui/search/searchFormLayout'

import {
  SearchFormState,
  SearchFormValue,
} from 'fragmentarium/ui/SearchForm.state'
export type {
  SearchFormState,
  SearchFormValue,
} from 'fragmentarium/ui/SearchForm.state'

interface Props {
  readonly state: SearchFormState
  readonly showAdvancedSearch: boolean
  readonly project?: keyof typeof ResearchProjects | null
  readonly fragmentSearchService: FragmentSearchService
  readonly fragmentService: FragmentService
  readonly dossiersService: DossiersService
  readonly wordService: WordService
  readonly onChange: (name: string) => (value: SearchFormValue) => void
  readonly onChangeNumber: (value: string) => void
  readonly onChangeBibliographyReference: (entry: BibliographyEntry) => void
  readonly onSearch: (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent,
  ) => void
  readonly onClearFindspot: () => void
  readonly onKeyDown: (event: React.KeyboardEvent) => void
}

export default function SearchFormFields({
  state,
  showAdvancedSearch,
  project,
  fragmentSearchService,
  fragmentService,
  dossiersService,
  wordService,
  onChange,
  onChangeNumber,
  onChangeBibliographyReference,
  onSearch,
  onClearFindspot,
  onKeyDown,
}: Props): JSX.Element {
  const rows = state.number?.split('\n').length ?? 0
  return (
    <>
      <FindspotConstraint
        findspotId={state.findspotId}
        onClear={onClearFindspot}
      />
      <Form onKeyDown={onKeyDown} className="SearchForm SearchForm__wrapper">
        <Row>
          <Col>
            <NumberSearchForm
              value={state.number}
              isValid={state.isValid}
              onChangeNumber={onChangeNumber}
            />
            <ReferenceSearchForm
              referenceEntry={state.referenceEntry}
              pages={state.pages}
              onChangePages={onChange('pages')}
              onChangeBibliographyReference={onChangeBibliographyReference}
              fragmentService={fragmentService}
            />
            <LemmaSearchForm
              lemmas={state.lemmas}
              lemmaOperator={state.lemmaOperator}
              onChange={onChange}
              onChangeLemmaOperator={onChange('lemmaOperator')}
              wordService={wordService}
            />
            <TransliterationSearchForm
              value={state.transliteration}
              onChangeTransliteration={onChange('transliteration')}
              rows={rows}
            />
            {!showAdvancedSearch ? (
              <Row className="SearchForm__advanced-link">
                <Col sm={helpColSize} className="SearchForm__help-col" />
                <Col>
                  <Button variant="link" onClick={onSearch}>
                    Advanced Search{' '}
                    <i className="fas fa-external-link" aria-hidden="true" />
                  </Button>
                </Col>
              </Row>
            ) : null}
          </Col>
          {showAdvancedSearch ? (
            <SearchFormAdvanced
              genre={state.genre}
              museum={state.museum}
              scriptPeriod={state.scriptPeriod}
              scriptPeriodModifier={state.scriptPeriodModifier}
              site={state.site}
              dossier={state.dossier}
              onChange={onChange}
              fragmentService={fragmentService}
              dossiersService={dossiersService}
            />
          ) : null}
        </Row>
        <Row>
          <Col>
            <Row>
              <Col sm={helpColSize} className="SearchForm__help-col" />
              <Col>
                <ButtonToolbar>
                  <Button
                    className="w-25 m-1"
                    onClick={onSearch}
                    variant="primary"
                    disabled={!state.isValid}
                  >
                    {project ? 'Search in ' + project : 'Search'}
                  </Button>
                  {!project ? (
                    <>
                      <LuckyButton
                        fragmentSearchService={fragmentSearchService}
                      />
                      <PioneersButton
                        fragmentSearchService={fragmentSearchService}
                      />
                    </>
                  ) : null}
                </ButtonToolbar>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </>
  )
}
