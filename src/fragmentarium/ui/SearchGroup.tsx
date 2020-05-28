import React, { Component, FunctionComponent } from 'react'
import NumberSearchForm from 'fragmentarium/ui/search/NumberSearchForm'
import TransliterationSearchForm from 'fragmentarium/ui/search/TransliterationSearchForm'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import './SearchGroup.css'
import _ from 'lodash'
import { Button, Col } from 'react-bootstrap'
import { stringify } from 'query-string'
import FragmentsSearchForm from './search/FragmentsSearchForm'

type Props = {
  number: string | null | undefined
  id: string | null | undefined
  page: string | null | undefined
  transliteration: string | null | undefined
  fragmentSearchService
} & RouteComponentProps
type State = {
  number: string | null | undefined
  id: string | null | undefined
  page: string | null | undefined
  transliteration: string | null | undefined
}
class SearchGroup extends Component<Props, State> {
  state = {
    number: this.props.number || '',
    id: this.props.number || '',
    page: this.props.number || '',
    transliteration: this.props.number || '',
  }

  handleChanges(searchForm: string, searchQuery: string) {
    const updatedState = _.cloneDeep(this.state)
    updatedState[searchForm] = searchQuery
    this.setState(updatedState)
  }

  search = (event) => {
    event.preventDefault()
    this.props.history.push(
      `/fragmentarium/search/?${stringify({
        id: this.state.id,
        page: this.state.page,
      })}`
    )
  }

  render() {
    return (
      <>
        ?
        <NumberSearchForm
          number={this.props.number}
          handleChanges={this.handleChanges.bind(this)}
        />
        <FragmentsSearchForm
          id={this.props.id}
          page={this.props.page}
          handleChanges={this.handleChanges.bind(this)}
        />
        <TransliterationSearchForm
          transliteration={this.props.transliteration}
          handleChanges={this.handleChanges.bind(this)}
        />
        <div className="SearchGroup__button-bar">
          <Button onClick={this.search} type="submit" variant="primary">
            Search
          </Button>{' '}
          <LuckyButton
            fragmentSearchService={this.props.fragmentSearchService}
          />{' '}
          <PioneersButton
            fragmentSearchService={this.props.fragmentSearchService}
          />
        </div>
      </>
    )
  }
}
export default withRouter(SearchGroup)
