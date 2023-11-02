import React, { Component } from 'react'
import { stringify } from 'query-string'
import _ from 'lodash'
import { Form, FormControl, Button, Row, Col } from 'react-bootstrap'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import AsyncSelect from 'react-select/async'
import { components, OptionProps } from 'react-select'

export type AfoRegisterQuery = { text: string; textNumber: string }
type Props = { query: AfoRegisterQuery } & RouteComponentProps

const optionProps: OptionProps<any, true> = {
  type: 'option',
  label: 'aaaaaaa',
  data: {},
  innerProps: {},
  innerRef: {},
  children: '',
} as OptionProps<any, true>

class AfoRegisterSearch extends Component<Props, { query: AfoRegisterQuery }> {
  state = { query: this.props.query }
  id = _.uniqueId('AfoRegisterSearch-')

  onChange = (event, field: 'text' | 'textNumber') => {
    const { query } = this.state
    query[field] = event.target.value
    this.setState({ query })
  }

  submit = (event) => {
    event.preventDefault()
    this.props.history.push(`?${stringify(this.state.query)}`)
  }

  render() {
    return (
      <Form onSubmit={this.submit}>
        <Form.Group as={Row} controlId={this.id} style={{ width: '100%' }}>
          <Col sm={5}>
            <AsyncSelect
              isClearable={true}
              aria-label="AfO-Register-Text-Publication"
              placeholder="Text or publication"
              cacheOptions
              loadOptions={async () => []}
              onChange={(event) => this.onChange(event, 'text')}
              value={
                <components.Option {...optionProps}>
                  {this.state.query.text}
                </components.Option>
              }
            />
          </Col>
          <Col sm={4}>
            <FormControl
              aria-label="AfO-Register-Number"
              type="text"
              value={this.state.query.textNumber}
              placeholder="Number"
              onChange={(event) => this.onChange(event, 'textNumber')}
            />
          </Col>
          <Col sm={2}>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default withRouter(AfoRegisterSearch)
