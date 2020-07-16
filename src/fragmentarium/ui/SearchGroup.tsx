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
  id: string | null | undefined
  title: string | null | undefined
  value: any
  pages: string | null | undefined
  transliteration: string | null | undefined
}

type Props = {
  number: string | null | undefined
  id: string | null | undefined
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
      title: this.props.title || '',
      value: undefined,
      id: this.props.id || '',
      pages: this.props.pages || '',
      transliteration: this.props.transliteration || '',
    }
    this.onChangeTitle = this.onChangeTitle.bind(this)
    this.onChangePages = this.onChangePages.bind(this)
    this.onChangeId = this.onChangeId.bind(this)
    this.onChangeValue = this.onChangeValue.bind(this)
  }

  onChange = (event) => {
    const { name, value } = event.target
    this.setState((prevState) => ({ ...prevState, [name]: value }))
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

  onChangeValue(value: any): void {
    this.setState({ value: value })
  }

  search = (event) => {
    event.preventDefault()
    this.props.history.push(`/fragmentarium/search/?${stringify(this.state)}`)
  }

  render() {
    return (
      <>
        <NumberSearchForm onChange={this.onChange} value={this.state.number} />
        <ReferenceSearchForm
          onChangeId={this.onChangeId}
          onChangeTitle={this.onChangeTitle}
          onChangePages={this.onChange}
          onChangeValue={this.onChangeValue}
          valueTitle={this.state.value}
          valuePages={this.state.pages}
          fragmentService={this.props.fragmentService}
        />
        <TransliterationSearchForm
          onChange={this.onChange}
          value={this.state.transliteration}
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
