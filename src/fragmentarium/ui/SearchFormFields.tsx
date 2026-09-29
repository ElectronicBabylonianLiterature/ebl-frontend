import React from 'react'
import { Button, ButtonToolbar, Col, Form, Row } from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import WordService from 'dictionary/application/WordService'
import DossiersService from 'dossiers/application/DossiersService'
import {
  PeriodModifierString,
  PeriodString,
  QueryType,
} from 'query/FragmentQuery'
import { ResearchProjects } from 'research-projects/researchProject'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import FindspotConstraint from 'fragmentarium/ui/FindspotConstraint'
import GenreSearchForm from 'fragmentarium/ui/search/SearchFormGenre'
import LemmaSearchForm from 'fragmentarium/ui/search/SearchFormLemma'
import MuseumSearchForm from 'fragmentarium/ui/search/SearchFormMuseum'
import NumberSearchForm from 'fragmentarium/ui/search/SearchFormNumber'
import PeriodSearchForm from 'fragmentarium/ui/search/SearchFormPeriod'
import ProvenanceSearchForm from 'fragmentarium/ui/search/SearchFormProvenance'
import ReferenceSearchForm from 'fragmentarium/ui/search/SearchFormReference'
import TransliterationSearchForm from 'fragmentarium/ui/search/SearchFormTransliteration'
import SearchFormDossier from 'fragmentarium/ui/search/SearchFormDossier'
import { helpColSize } from 'fragmentarium/ui/search/searchFormLayout'

export interface SearchFormState {
  number: string | null
  referenceEntry: { id: string; label: string }
  pages: string | null
  lemmas: string | null
  lemmaOperator: QueryType | null
  transliteration: string | null
  scriptPeriod: PeriodString
  scriptPeriodModifier: PeriodModifierString
  genre: string | null
  project: keyof typeof ResearchProjects | null
  isValid: boolean
  site: string | null
  museum: string | null
  dossier: string | null
  findspotId: number | string | null
}

export type SearchFormValue =
  | string
  | null
  | undefined
  | QueryType
  | BibliographyEntry
  | keyof typeof ResearchProjects

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

const SearchField = <T extends React.ElementType>({
  component: Component,
  ...props
}: { component: T } & React.ComponentProps<T>) => <Component {...props} />

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
  const serviceField = (
    component: React.ElementType,
    value: string | null,
    key: string,
  ) => (
    <SearchField
      component={component}
      value={value}
      onChange={onChange(key)}
      fragmentService={fragmentService}
    />
  )

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
            <Col md={6}>
              {serviceField(GenreSearchForm, state.genre, 'genre')}
              <SearchField
                component={MuseumSearchForm}
                value={state.museum}
                onChange={onChange('museum')}
              />
              <PeriodSearchForm
                scriptPeriod={state.scriptPeriod}
                scriptPeriodModifier={state.scriptPeriodModifier}
                onChangeScriptPeriod={onChange('scriptPeriod')}
                onChangeScriptPeriodModifier={onChange('scriptPeriodModifier')}
                fragmentService={fragmentService}
              />
              {serviceField(ProvenanceSearchForm, state.site, 'site')}
              <SearchFormDossier
                ariaLabel="Dossier"
                value={state.dossier}
                searchSuggestions={(inputValue, filters) =>
                  dossiersService.searchSuggestions(inputValue, filters)
                }
                onChange={onChange('dossier')}
                isClearable={true}
                filters={{
                  provenance: state.site,
                  scriptPeriod: state.scriptPeriod,
                  genre: state.genre,
                }}
              />
            </Col>
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
