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
    this.onChangeNumber = this.onChangeNumber.bind(this)
    this.onChangeTransliteration = this.onChangeTransliteration.bind(this)
    this.onChangeTitle = this.onChangeTitle.bind(this)
    this.onChangePages = this.onChangePages.bind(this)
    this.onChangeId = this.onChangeId.bind(this)
  }

  onChange(searchForm: string, searchQuery: string): void {
    this.setState({ [searchForm]: searchQuery } as Pick<State, keyof State>)
  }

  onChangeNumber(value: string): void {
    this.setState({ number: value })
  }
  onChangeTransliteration(value: string): void {
    this.setState({ transliteration: value })
  }

  onChangePages(value: string): void {
    this.setState({ pages: value })
  }
  onChangeTitle(value: string): void {
    this.setState({ title: value })
  }

  onChangeId(value: string): void {
    this.setState({ id: value })
  }

  search = (event) => {
    event.preventDefault()
    this.props.history.push(`/fragmentarium/search/?${stringify(this.state)}`)
  }

  render() {
    return (
      <>
        <NumberSearchForm
          onChangeNumber={this.onChangeNumber}
          value={this.props.number}
        />
        <ReferenceSearchForm
          onChangeId={this.onChangeId}
          onChangeTitle={this.onChangeTitle}
          onChangePages={this.onChangePages}
          value_title={this.props.title}
          value_pages={this.props.pages}
          fragmentService={this.props.fragmentService}
        />
        <TransliterationSearchForm
          onChangeTransliteration={this.onChangeTransliteration}
          value={this.props.transliteration}
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
