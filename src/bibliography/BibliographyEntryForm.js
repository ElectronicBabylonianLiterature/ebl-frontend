import React, { Component } from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import Cite from 'citation-js'
import _ from 'lodash'
import Promise from 'bluebird'
import { Parser } from 'html-to-react'

import ExternalLink from 'common/ExternalLink'
import Spinner from 'common/Spinner'

export default class BibliographyEntryForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      citation: '',
      cslData: null,
      value: '',
      loading: false,
      isInvalid: false
    }
    this.promise = Promise.resolve()
    this.doLoad = _.debounce(this.load, 500, {
      leading: false,
      trailing: true
    })
  }

  get isValid () {
    return _.isArray(this.state.cslData) && this.state.cslData.length === 1
  }

  get isInvalid () {
    return !this.state.loading &&
      !_.isEmpty(this.state.value) && (
      this.state.isInvalid || !this.isValid
    )
  }

  handleChange = ({ target: { value } }) => {
    this.setState({
      ...this.state,
      value: value,
      loading: true,
      isInvalid: false
    })
    this.promise = this.doLoad(value) || this.promise
  }

  load = value => {
    this.promise.cancel()
    return new Promise((resolve, reject) => {
      Cite.async(value).then(resolve).catch(reject)
    }).then(cite => {
      this.setState({
        ...this.state,
        citation: cite.format('bibliography', {
          format: 'html',
          template: 'citation-apa',
          lang: 'de-DE'
        }),
        cslData: cite.get({
          format: 'real',
          type: 'json',
          style: 'csl'
        }),
        loading: false
      })
    }).catch(error => {
      console.error(error)
      this.setState({
        ...this.state,
        citation: '',
        cslData: null,
        loading: false,
        isInvalid: true
      })
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    this.props.onSubmit(this.state.cite.format('bibliography'))
  }

  render () {
    const parsed = new Parser().parse(this.state.citation)
    return (<>
      <Form>
        <Form.Group controlId={'editor'}>
          <Form.Label>Bibtex</Form.Label>
          <InputGroup>
            <Form.Control
              as='textarea'
              value={this.state.value}
              onChange={this.handleChange}
              isValid={this.isValid}
              isInvalid={this.isInvalid} />
            <Form.Control.Feedback type='invalid'>
              Invalid entry
            </Form.Control.Feedback>
          </InputGroup>
          <p>
            You can enter a DOI, BibTeX, or any <ExternalLink href='https://citation.js.org/api/tutorial-input_formats.html'>supported input format</ExternalLink>.
            BibTeX can be generated with <ExternalLink href='https://truben.no/latex/bibtex/'>BibTeX Online Editor</ExternalLink>.
          </p>
        </Form.Group>
      </Form>
      <Spinner loading={this.state.loading} />
      {parsed}
    </>)
  }
}
