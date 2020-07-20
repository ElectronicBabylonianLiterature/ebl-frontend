import React, { Component } from 'react'
import NumberSearchForm from 'fragmentarium/ui/search/NumberSearchForm'
import TransliterationSearchForm from 'fragmentarium/ui/search/TransliterationSearchForm'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Button, ButtonToolbar, Col } from 'react-bootstrap'
import { stringify } from 'query-string'
import ReferenceSearchForm from 'fragmentarium/ui/search/ReferenceSearchForm'

interface State {
  number: string | null | undefined
  referenceEntry: any
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

class SearchGroup extends Component<Props, State> {
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
    this.setState({ pages: value })
    this.setState({ isValid: this.isValid(value) })
  }

  onChangeBibliographyReference = (event) => {
    const newState = { ...this.state }
    newState.referenceEntry.title = event.cslData.title || ''
    newState.referenceEntry.id = event.cslData.id || ''
    newState.referenceEntry.primaryAuthor = event.cslData.author[0].family || ''
    newState.referenceEntry.year =
      event.cslData.issued['date-parts'][0][0] || ''
    this.setState(newState)
  }
  isValid(pages: string | null | undefined): boolean {
    return !!(Number(pages) || !pages)
  }

  flattenState(state: State) {
    const flattenedState = {
      number: state.number,
      id: state.referenceEntry.id,
      title: state.referenceEntry.title,
      primaryAuthor: state.referenceEntry.primaryAuthor,
      year: state.referenceEntry.year,
      pages: state.pages,
      transliteration: state.transliteration,
    }
    return flattenedState
  }
  search = (event) => {
    event.preventDefault()
    this.props.history.push(
      `/fragmentarium/search/?${stringify(this.flattenState(this.state))}`
    )
  }

  render(): JSX.Element {
    return (
      <>
        <NumberSearchForm
          onChange={this.onChange('number')}
          value={this.state.number}
        />
        <ReferenceSearchForm
          onChangePages={this.onChangePages}
          onChangeBibliographyReference={this.onChangeBibliographyReference}
          valueBibReference={this.state.referenceEntry}
          valuePages={this.state.pages}
          fragmentService={this.props.fragmentService}
          isValid={this.state.isValid}
        />
        <TransliterationSearchForm
          onChange={this.onChange('transliteration')}
          value={this.state.transliteration}
        />
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
export default withRouter(SearchGroup)
