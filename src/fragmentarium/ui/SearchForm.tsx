import React, { Component } from 'react'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Button, ButtonToolbar, Col, Form, Popover, Row } from 'react-bootstrap'
import { stringify } from 'query-string'
import BibliographySelect from '../../bibliography/ui/BibliographySelect'
import HelpTrigger from '../../common/HelpTrigger'
import _ from 'lodash'
import produce from 'immer'

interface State {
  number: string | null | undefined
  referenceEntry: {
    id: string
    title: string
    primaryAuthor: string
    year: string
  }
  pages: string | null | undefined
  transliteration: string | null | undefined
  isValid: boolean
}

type Props = {
  number: string | null | undefined
  id: string | null | undefined
  primaryAuthor: string | null | undefined
  year: string | null | undefined
  title: string | null | undefined
  pages: string | null | undefined
  transliteration: string | null | undefined
  fragmentService
  fragmentSearchService
  history: History
} & RouteComponentProps

class SearchForm extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      number: this.props.number || '',
      referenceEntry: {
        id: this.props.id || '',
        title: this.props.title || '',
        primaryAuthor: this.props.primaryAuthor || '',
        year: this.props.year || '',
      },
      pages: this.props.pages || '',
      transliteration: this.props.transliteration || '',
      isValid: this.isValid(this.props.pages || ''),
    }
  }

  onChange = (name: string) => (value): void => {
    this.setState((prevState) => ({ ...prevState, [name]: value }))
  }

  onChangePages = (value: string): void => {
    this.setState({ pages: value, isValid: this.isValid(value) })
  }
  isValid(pages: string | null | undefined): boolean {
    return !!(Number(pages) || !pages)
  }

  onChangeBibliographyReference = (event) => {
    const newState = produce(this.state, (draftState) => {
      draftState.referenceEntry.title = event ? event.entry.cslData.title : ''
      draftState.referenceEntry.id = event ? event.entry.cslData.id : ''
      draftState.referenceEntry.primaryAuthor = event
        ? event.entry.cslData.author[0].family
        : ''
      draftState.referenceEntry.year = event
        ? event.entry.cslData.issued['date-parts'][0][0]
        : ''
    })
    this.setState(newState)
  }

  flattenState(state: State) {
    return {
      number: state.number,
      id: state.referenceEntry.id,
      title: state.referenceEntry.title,
      primaryAuthor: state.referenceEntry.primaryAuthor,
      year: state.referenceEntry.year,
      pages: state.pages,
      transliteration: state.transliteration,
    }
  }
  search = (event) => {
    event.preventDefault()
    this.props.history.push(
      `/fragmentarium/search/?${stringify(this.flattenState(this.state))}`
    )
  }
  ReferenceSearchHelp(): JSX.Element {
    return (
      <Popover
        id={_.uniqueId('ReferenceSearchHelp-')}
        title="Search References"
      >
        <Popover.Content>
          Search for Author and Year <br />
          (e.g. <code>George 20</code> or <code>George 2003</code>) or
          Abbreviation (and Number) <br />
          (e.g. <code>BWL</code> or <code>CT 13</code>)
        </Popover.Content>
      </Popover>
    )
  }
  TransliterationSearchHelp(): JSX.Element {
    return (
      <Popover
        id={_.uniqueId('TransliterationSearchHelp-')}
        title="Search transliterations"
      >
        <Popover.Content>
          <ul>
            <li>
              Sequences of signs are retrieved regardless of the values entered:
              e.g., <code>me lik</code> will retrieve <code>šip taš</code>,{' '}
              <code>me ur</code>, etc.
            </li>
            <li>
              Signs in consecutive lines can be searched by entering them in
              consecutive lines of the search field.
            </li>
            <li>
              Text with diacritics (e.g. <code>ša₂</code>, <code>á</code>) or
              without them (e.g. <code>sza2</code> or <code>ca2</code>,{' '}
              <code>s,a3</code>, <code>t,a4</code>) can be entered.
            </li>
          </ul>
        </Popover.Content>
      </Popover>
    )
  }

  render(): JSX.Element {
    const rows = this.state.transliteration?.split('\n').length ?? 0
    return (
      <>
        <Form>
          <Form.Group as={Row} controlId="number">
            <Col sm={{ span: 10, offset: 2 }}>
              <Form.Control
                type="text"
                name="number"
                value={this.state.number || ''}
                placeholder="Search museum, accession, or CDLI number"
                aria-label="Number"
                onChange={(
                  event: React.ChangeEvent<HTMLTextAreaElement>
                ): void => this.onChange('number')(event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="reference">
            <Col
              sm={2}
              as={Form.Label}
              className="TransliterationSearchForm__label"
            >
              <HelpTrigger overlay={this.ReferenceSearchHelp()} />
            </Col>
            <Col>
              <BibliographySelect
                isClearable={true}
                aria-label="Select bibliography reference"
                value={this.state.referenceEntry}
                onChange={this.onChangeBibliographyReference}
                searchBibliography={(query) =>
                  this.props.fragmentService.searchBibliography(query)
                }
              />
            </Col>
            <Col sm={5}>
              <Form.Control
                type="text"
                name="pages"
                placeholder="Page"
                aria-label="Pages"
                value={this.state.pages || ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
                  this.onChangePages(event.target.value)
                }
                isInvalid={!this.state.isValid}
              />
              <Form.Control.Feedback type="invalid">
                &quot;Page&quot; should be numeric.
              </Form.Control.Feedback>
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="transliteration">
            <Col
              sm={2}
              as={Form.Label}
              className="TransliterationSearchForm__label"
            >
              <HelpTrigger overlay={this.TransliterationSearchHelp()} />
            </Col>
            <Col sm={10}>
              <Form.Control
                as="textarea"
                value={this.state.transliteration || ''}
                rows={Math.max(2, rows)}
                placeholder="Search transliterations"
                aria-label="Transliteration"
                name="transliteration"
                onChange={(
                  event: React.ChangeEvent<HTMLTextAreaElement>
                ): void => this.onChange('transliteration')(event.target.value)}
              />
            </Col>
          </Form.Group>
        </Form>
        <ButtonToolbar>
          <Col sm={{ offset: 2 }}>
            <Button
              className="w-25 m-1"
              onClick={this.search}
              variant="primary"
              disabled={!this.state.isValid}
            >
              Search
            </Button>
            <LuckyButton
              fragmentSearchService={this.props.fragmentSearchService}
            />
            <PioneersButton
              fragmentSearchService={this.props.fragmentSearchService}
            />
          </Col>
        </ButtonToolbar>
      </>
    )
  }
}
export default withRouter(SearchForm)
