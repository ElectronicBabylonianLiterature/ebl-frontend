import React, { Component } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Button, ButtonToolbar, Col, Form } from 'react-bootstrap'
import { stringify } from 'query-string'
import _ from 'lodash'
import produce from 'immer'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordService from 'dictionary/application/WordService'
import DossiersService from 'dossiers/application/DossiersService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import {
  FragmentQuery,
  PeriodModifierString,
  PeriodString,
  QueryType,
} from 'query/FragmentQuery'
import { ResearchProjects } from 'research-projects/researchProject'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import LemmaSearchForm from './LemmaSearchForm'
import NumberSearchForm from './NumberSearchForm'
import ReferenceSearchForm from './ReferenceSearchForm'
import TransliterationSearchForm from './TransliterationSearchForm'
import './SearchForm.sass'

export interface State {
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
  activeKey: string | undefined
}

export type SearchFormValue =
  | string
  | null
  | undefined
  | QueryType
  | BibliographyEntry
  | keyof typeof ResearchProjects

export type SearchFormProps = {
  fragmentSearchService: FragmentSearchService
  fragmentService: FragmentService
  dossiersService: DossiersService
  bibliographyService: BibliographyService
  fragmentQuery?: FragmentQuery
  wordService: WordService
  history: History
  project?: keyof typeof ResearchProjects | null
  formState: State
  onFormStateChange: (state: State) => void
  onToggleAdvancedSearch: () => void
} & RouteComponentProps

export function isValidNumber(number?: string): boolean {
  return !number || !/^\[.*\]+$/.test(number.trim())
}

export const helpColSize = 1

class SearchForm extends Component<SearchFormProps> {
  basepath: string

  constructor(props: SearchFormProps) {
    super(props)
    this.basepath = props.formState.project
      ? `/projects/${props.formState.project.toLowerCase()}/search/`
      : '/library/search/'

    if (
      props.formState.referenceEntry.id &&
      props.formState.referenceEntry.label === ''
    ) {
      this.fetchReferenceLabel()
    }
  }

  fetchReferenceLabel = async (): Promise<void> => {
    const { bibliographyService } = this.props
    const { id } = this.props.formState.referenceEntry
    const reference = await bibliographyService.find(id)
    this.props.onFormStateChange(
      produce(this.props.formState, (draft) => {
        draft.referenceEntry = { id, label: reference.label }
      })
    )
  }

  onChange = (name: keyof State) => (value: SearchFormValue): void => {
    this.props.onFormStateChange({
      ...this.props.formState,
      [name]: value ?? null,
    })
  }

  // Wrapper function for LemmaSearchForm
  handleLemmaChange = (name: string) => (value: string): void => {
    this.onChange(name as keyof State)(value)
  }

  onChangeNumber = (value: string): void => {
    this.props.onFormStateChange({
      ...this.props.formState,
      number: value,
      isValid: isValidNumber(value),
    })
  }

  onChangeBibliographyReference = (event: BibliographyEntry): void => {
    this.props.onFormStateChange(
      produce(this.props.formState, (draft) => {
        draft.referenceEntry.label = event.label || ''
        draft.referenceEntry.id = event.id || ''
      })
    )
  }

  flattenState(state: State): FragmentQuery {
    const cleanedTransliteration = _.trimEnd(state.transliteration || '')
    const stateWithoutNull = _.omitBy(
      {
        number: state.number,
        lemmas: state.lemmas,
        lemmaOperator: state.lemmas ? state.lemmaOperator : '',
        bibId: state.referenceEntry.id,
        label: state.referenceEntry.label,
        pages: state.pages,
        transliteration: replaceTransliteration(cleanedTransliteration) ?? '',
        scriptPeriodModifier: state.scriptPeriod
          ? state.scriptPeriodModifier
          : '',
        scriptPeriod: state.scriptPeriod,
        genre: state.genre,
        site: state.site ? state.site.split(/\[|\]/)[0] : '',
        project: state.project,
        museum: state.museum,
      },
      (value) => !value
    )
    return _.omit(stateWithoutNull, 'isValid') as FragmentQuery
  }

  search = (event: React.MouseEvent<HTMLElement>): void => {
    event.preventDefault()
    const updatedState = this.flattenState(this.props.formState)
    this.onChange('transliteration')(updatedState.transliteration)
    this.props.history.push(`${this.basepath}?${stringify(updatedState)}`)
  }

  render(): JSX.Element {
    const { formState } = this.props
    const rows = formState.number?.split('\n').length ?? 0

    return (
      <>
        <Form>
          <NumberSearchForm
            value={formState.number}
            isValid={formState.isValid}
            onChangeNumber={this.onChangeNumber}
          />
          <ReferenceSearchForm
            referenceEntry={formState.referenceEntry}
            pages={formState.pages}
            onChangePages={this.onChange('pages')}
            onChangeBibliographyReference={this.onChangeBibliographyReference}
            fragmentService={this.props.fragmentService}
          />
          <LemmaSearchForm
            lemmas={formState.lemmas}
            lemmaOperator={formState.lemmaOperator}
            onChange={this.handleLemmaChange} // Use the wrapper function
            onChangeLemmaOperator={this.onChange('lemmaOperator')}
            wordService={this.props.wordService}
          />
          <TransliterationSearchForm
            value={formState.transliteration}
            onChangeTransliteration={this.onChange('transliteration')}
            rows={rows}
          />
        </Form>
        <ButtonToolbar>
          <Col sm={{ offset: 1 }} className="SearchForm__ButtonToolbar">
            <Button
              className="w-25 m-1"
              onClick={this.search}
              variant="primary"
              disabled={!formState.isValid}
            >
              {formState.project ? `Search in ${formState.project}` : 'Search'}
            </Button>
            {!formState.project && (
              <>
                <LuckyButton
                  fragmentSearchService={this.props.fragmentSearchService}
                />
                <Button
                  className="m-1"
                  variant="outline-primary"
                  onClick={this.props.onToggleAdvancedSearch}
                >
                  Advanced Search
                </Button>
                <PioneersButton
                  fragmentSearchService={this.props.fragmentSearchService}
                />
              </>
            )}
          </Col>
        </ButtonToolbar>
      </>
    )
  }
}

export default withRouter(SearchForm)
