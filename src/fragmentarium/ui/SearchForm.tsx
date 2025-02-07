import React, { Component } from 'react'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import {
  Button,
  ButtonToolbar,
  Col,
  Form,
  OverlayTriggerProps,
  Row,
} from 'react-bootstrap'
import { stringify } from 'query-string'
import BibliographySelect from 'bibliography/ui/BibliographySelect'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'
import produce from 'immer'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import {
  FragmentQuery,
  PeriodModifierString,
  PeriodString,
  QueryType,
} from 'query/FragmentQuery'
import WordService from 'dictionary/application/WordService'
import { LemmaQueryTypeForm, LemmaSearchForm } from './LemmaSearchForm'
import { PeriodSearchForm, PeriodModifierSearchForm } from './ScriptSearchForm'
import {
  MuseumSearchHelp,
  ReferenceSearchHelp,
  TransliterationSearchHelp,
  LemmaSearchHelp,
  ScriptSearchHelp,
  GenreSearchHelp,
  ProvenanceSearchHelp,
} from './SearchHelp'
import GenreSearchForm from './GenreSearchForm'
import BibliographyService from 'bibliography/application/BibliographyService'
import { ResearchProjects } from 'research-projects/researchProject'
import './SearchForm.sass'
import ProvenanceSearchForm from './ProvenanceSearchForm'
import DossiersService from 'dossiers/application/DossiersService'

interface State {
  number: string | null
  referenceEntry: {
    id: string
    label: string
  }
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
}

export type SearchFormProps = {
  fragmentSearchService: FragmentSearchService
  fragmentService: FragmentService
  dossiersService: DossiersService
  bibliographyService: BibliographyService
  fragmentQuery?: FragmentQuery
  wordService: WordService
  history: History
  project?: keyof typeof ResearchProjects | null
} & RouteComponentProps

export function isValidNumber(number?: string): boolean {
  return !number || !/^[.*]+$/.test(number.trim())
}

export const helpColSize = 1

function HelpCol({
  ...props
}: Pick<OverlayTriggerProps, 'overlay'>): JSX.Element {
  return (
    <Col
      sm={helpColSize}
      as={Form.Label}
      className="TransliterationSearchForm__label"
    >
      <HelpTrigger {...props} />
    </Col>
  )
}

class SearchForm extends Component<SearchFormProps, State> {
  basepath: string
  constructor(props: SearchFormProps) {
    super(props)
    this.basepath = props.project
      ? `/projects/${props.project.toLowerCase()}/search/`
      : '/library/search/'

    const fragmentQuery = this.props.fragmentQuery || {}

    this.state = {
      number: fragmentQuery.number || null,
      referenceEntry: {
        id: fragmentQuery.bibId || '',
        label: fragmentQuery.bibLabel || '',
      },
      pages: fragmentQuery.pages || null,
      lemmas: fragmentQuery.lemmas || '',
      lemmaOperator: fragmentQuery.lemmaOperator || 'line',
      transliteration: fragmentQuery.transliteration || '',
      scriptPeriod: fragmentQuery.scriptPeriod || '',
      scriptPeriodModifier: fragmentQuery.scriptPeriodModifier || '',
      genre: fragmentQuery.genre || '',
      site: fragmentQuery.site || '',
      isValid: isValidNumber(fragmentQuery.number),
      project: fragmentQuery.project || null,
    }

    if (
      this.state.referenceEntry.id &&
      this.state.referenceEntry.label === ''
    ) {
      this.fetchReferenceLabel()
    }
  }

  fetchReferenceLabel = async () => {
    const { bibliographyService } = this.props
    const { id } = this.state.referenceEntry
    const reference = await bibliographyService.find(id)
    this.setState({
      referenceEntry: {
        id: id,
        label: reference.label,
      },
    })
  }

  onChange = (name: string) => (value): void => {
    this.setState((prevState) => ({ ...prevState, [name]: value }))
  }

  onChangeNumber = (value: string): void => {
    this.setState({ number: value, isValid: isValidNumber(value) })
  }

  onChangeBibliographyReference = (event: BibliographyEntry) => {
    const newState = produce(this.state, (draftState) => {
      draftState.referenceEntry.label = event.label || ''
      draftState.referenceEntry.id = event.id || ''
    })
    this.setState(newState)
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
        transliteration: replaceTransliteration(cleanedTransliteration),
        scriptPeriodModifier: state.scriptPeriod
          ? state.scriptPeriodModifier
          : '',
        scriptPeriod: state.scriptPeriod,
        genre: state.genre,
        site: state.site ? state.site.split(/\[|\]/)[0] : '',
        project: state.project,
      },
      (value) => !value
    )
    return _.omit(stateWithoutNull, 'isValid')
  }
  search = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    const updatedState = this.flattenState(this.state)
    this.onChange('transliteration')(updatedState.transliteration)
    this.props.history.push(`${this.basepath}?${stringify(updatedState)}`)
  }

  render(): JSX.Element {
    const rows = this.state.number?.split('\n').length ?? 0
    const numberSearchForm = (
      <Form.Group as={Row} controlId="number">
        <HelpCol overlay={MuseumSearchHelp()} />
        <Col>
          <Form.Control
            type="text"
            name="number"
            value={this.state.number || ''}
            placeholder="Museum, accession, CDLI, or excavation number"
            aria-label="Number"
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>): void =>
              this.onChangeNumber(event.target.value)
            }
            isInvalid={!this.state.isValid}
          />
          <Form.Control.Feedback type="invalid">
            At least one of prefix, number or suffix must be specified.
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
    )
    const bibliographySearchForm = (
      <Form.Group as={Row} controlId="reference">
        <HelpCol overlay={ReferenceSearchHelp()} />
        <Col>
          <BibliographySelect
            isClearable={true}
            ariaLabel="Select bibliography reference"
            value={this.state.referenceEntry}
            onChange={this.onChangeBibliographyReference}
            searchBibliography={(query) =>
              this.props.fragmentService.searchBibliography(query)
            }
          />
        </Col>
        <Col>
          <Form.Control
            type="text"
            name="pages"
            placeholder="Page"
            aria-label="Pages"
            value={this.state.pages || ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
              this.onChange('pages')(event.target.value)
            }
          />
        </Col>
      </Form.Group>
    )
    const periodSearchForm = (
      <Form.Group as={Row} controlId="period">
        <HelpCol overlay={ScriptSearchHelp()} />
        <Col>
          <PeriodModifierSearchForm
            onChange={this.onChange('scriptPeriodModifier')}
            value={this.state.scriptPeriodModifier}
          />
        </Col>
        <Col>
          <PeriodSearchForm
            fragmentService={this.props.fragmentService}
            onChange={this.onChange('scriptPeriod')}
            value={this.state.scriptPeriod}
          />
        </Col>
      </Form.Group>
    )
    const provenanceSearchForm = (
      <Form.Group as={Row} controlId="site">
        <HelpCol overlay={ProvenanceSearchHelp()} />
        <Col>
          <ProvenanceSearchForm
            fragmentService={this.props.fragmentService}
            onChange={this.onChange('site')}
            value={this.state.site}
          />
        </Col>
      </Form.Group>
    )
    const genreSearchForm = (
      <Form.Group as={Row} controlId="genre">
        <HelpCol overlay={GenreSearchHelp()} />
        <Col>
          <GenreSearchForm
            fragmentService={this.props.fragmentService}
            onChange={this.onChange('genre')}
            value={this.state.genre}
          />
        </Col>
      </Form.Group>
    )
    const lemmaSearchForm = (
      <Form.Group as={Row} controlId="lemmas">
        <HelpCol overlay={LemmaSearchHelp()} />
        <Col>
          <LemmaSearchForm
            wordService={this.props.wordService}
            onChange={this.onChange}
            lemmas={this.state.lemmas ?? ''}
          />
        </Col>
        <Col sm={3}>
          <LemmaQueryTypeForm
            value={this.state.lemmaOperator || 'line'}
            onChange={this.onChange('lemmaOperator')}
          />
        </Col>
      </Form.Group>
    )
    const transliterationSearchForm = (
      <Form.Group as={Row} controlId="transliteration">
        <HelpCol overlay={TransliterationSearchHelp()} />
        <Col sm={12 - helpColSize}>
          <Form.Control
            as="textarea"
            value={this.state.transliteration || ''}
            rows={Math.max(2, rows)}
            placeholder="Transliterations"
            aria-label="Transliteration"
            name="transliteration"
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>): void =>
              this.onChange('transliteration')(event.target.value)
            }
          />
        </Col>
      </Form.Group>
    )
    return (
      <>
        <Form>
          {numberSearchForm}
          {bibliographySearchForm}
          {periodSearchForm}
          {provenanceSearchForm}
          {genreSearchForm}
          {lemmaSearchForm}
          {transliterationSearchForm}
        </Form>
        <ButtonToolbar>
          <Col
            sm={{ offset: helpColSize }}
            className="SearchForm__ButtonToolbar"
          >
            <Button
              className="w-25 m-1"
              onClick={this.search}
              variant="primary"
              disabled={!this.state.isValid}
            >
              {this.props.project
                ? `Search in ${this.props.project}`
                : 'Search'}
            </Button>
            {!this.props.project && (
              <>
                <LuckyButton
                  fragmentSearchService={this.props.fragmentSearchService}
                />
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
