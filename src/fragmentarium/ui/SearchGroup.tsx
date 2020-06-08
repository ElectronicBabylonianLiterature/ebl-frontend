import React, { Component } from 'react'
import NumberSearchForm from 'fragmentarium/ui/search/NumberSearchForm'
import TransliterationSearchForm from 'fragmentarium/ui/search/TransliterationSearchForm'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import './SearchGroup.css'
import _ from 'lodash'
import { Button } from 'react-bootstrap'
import { stringify } from 'query-string'
import ReferenceSearchForm from './search/ReferenceSearchForm'

type State = {
  number: string | null | undefined
  id: string | null | undefined
  pages: string | null | undefined
  transliteration: string | null | undefined
}

type Props = State & {
  fragmentSearchService
} & RouteComponentProps

class SearchGroup extends Component<Props, State> {
  state = {
    number: this.props.number || '',
    id: this.props.number || '',
    pages: this.props.number || '',
    transliteration: this.props.number || '',
  }

  handleChanges(searchForm: string, searchQuery: string) {
    const updatedState = _.cloneDeep(this.state)
    updatedState[searchForm] = searchQuery
    this.setState(updatedState)
  }

  deleteEmptyProperties(state: State) {
    const cleanedState = _.cloneDeep(state)
    helperDelete('number')
    if (!cleanedState['id']) {
      helperDelete('id')
      helperDelete('pages')
    }
    helperDelete('transliteration')

    function helperDelete(value: string) {
      if (!cleanedState[value]) {
        delete cleanedState[value]
      }
    }
    return cleanedState
  }

  search = (event) => {
    event.preventDefault()
    this.props.history.push(
      `/fragmentarium/search/?${stringify(
        this.deleteEmptyProperties(this.state)
      )}`
    )
  }

  render() {
    return (
      <>
        <NumberSearchForm
          number={this.props.number}
          handleChanges={this.handleChanges.bind(this)}
        />
        <ReferenceSearchForm
          id={this.props.id}
          pages={this.props.pages}
          handleChanges={this.handleChanges.bind(this)}
        />
        <TransliterationSearchForm
          transliteration={this.props.transliteration}
          handleChanges={this.handleChanges.bind(this)}
        />
        <div className="SearchGroup__button-bar">
          <Button className="w-25 m-2" onClick={this.search} variant="primary">
            Search
          </Button>
          <LuckyButton
            fragmentSearchService={this.props.fragmentSearchService}
          />
          <PioneersButton
            fragmentSearchService={this.props.fragmentSearchService}
          />
        </div>
      </>
    )
  }
}
export default withRouter(SearchGroup)
