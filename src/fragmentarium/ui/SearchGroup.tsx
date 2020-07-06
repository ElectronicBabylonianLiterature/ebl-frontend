import React, { Component } from 'react'
import NumberSearchForm from 'fragmentarium/ui/search/NumberSearchForm'
import TransliterationSearchForm from 'fragmentarium/ui/search/TransliterationSearchForm'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Button, ButtonToolbar, Col } from 'react-bootstrap'
import { stringify } from 'query-string'
import ReferenceSearchForm from 'fragmentarium/ui/search/ReferenceSearchForm'
import {
  FragmentariumSearchParams,
  SearchGroupParams,
} from 'fragmentarium/ui/fragmentariumSearch'

type State = SearchGroupParams

type Props = FragmentariumSearchParams & RouteComponentProps

class SearchGroup extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      number: this.props.number || '',
      title: this.props.title || '',
      id: this.props.id || '',
      pages: this.props.pages || '',
      transliteration: this.props.transliteration || '',
    }
    this.onChange = this.onChange.bind(this)
    this.getState = this.getState.bind(this)
  }

  onChange(searchForm: string, searchQuery: string): void {
    this.setState({ [searchForm]: searchQuery } as Pick<State, keyof State>)
  }
  getState(key: string): string {
    return this.state[key] ? this.state[key] : ''
  }

  search = (event) => {
    event.preventDefault()
    this.props.history.push(`/fragmentarium/search/?${stringify(this.state)}`)
  }

  render() {
    return (
      <>
        <NumberSearchForm onChange={this.onChange} getState={this.getState} />
        <ReferenceSearchForm
          onChange={this.onChange}
          getState={this.getState}
          fragmentService={this.props.fragmentService}
        />
        <TransliterationSearchForm
          onChange={this.onChange}
          getState={this.getState}
        />
        <ButtonToolbar>
          <Col sm={{ offset: 2 }}>
            <Button
              className="w-25 m-1"
              onClick={this.search}
              variant="primary"
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
