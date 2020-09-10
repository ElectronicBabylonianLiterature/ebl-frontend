import React, { Component } from 'react'
import { Form, InputGroup, Button } from 'react-bootstrap'
import Cite from 'citation-js'
import _ from 'lodash'
import Promise from 'bluebird'
import { Parser } from 'html-to-react'

import ExternalLink from 'common/ExternalLink'
import Spinner from 'common/Spinner'
import BibliographyEntry, {
  CslData,
} from 'bibliography/domain/BibliographyEntry'

import './BibliographyEntryForm.css'

function BibliographyHelp() {
  return (
    <p>
      You can enter a DOI, CSL-JSON, BibTeX, or any{' '}
      <ExternalLink href="https://citation.js.org/api/tutorial-input_formats.html">
        supported input format
      </ExternalLink>
      . BibTeX can be generated with{' '}
      <ExternalLink href="https://truben.no/latex/bibtex/">
        BibTeX Online Editor
      </ExternalLink>
      .
    </p>
  )
}

interface Props {
  value?: BibliographyEntry | null
  disabled: boolean
  onSubmit: (entry: BibliographyEntry) => unknown
}

interface State {
  citation: string
  value: string
  cslData: ReadonlyArray<CslData> | null
  loading: boolean
  isInvalid: boolean
}

export default class BibliographyEntryForm extends Component<Props, State> {
  static defaultProps: { value: null; disabled: false }
  private promise: Promise<void>
  private doLoad: (value: string) => Promise<void> | undefined

  constructor(props: Props) {
    super(props)
    this.state = props.value
      ? {
          citation: props.value.toHtml(),
          cslData: [props.value.toJson()],
          value: JSON.stringify(props.value.toJson(), null, 2),
          loading: false,
          isInvalid: false,
        }
      : {
          citation: '',
          cslData: null,
          value: '',
          loading: false,
          isInvalid: false,
        }
    this.promise = Promise.resolve()
    this.doLoad = _.debounce(this.load, 500, {
      leading: false,
      trailing: true,
    })
  }

  get isValid(): boolean {
    return _.isArray(this.state.cslData) && this.state.cslData.length === 1
  }

  get isInvalid(): boolean {
    return (
      !this.state.loading &&
      !_.isEmpty(this.state.value) &&
      (this.state.isInvalid || !this.isValid)
    )
  }

  get isDisabled(): boolean {
    return !this.isValid || this.props.disabled
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      ...this.state,
      value: event.target.value,
      loading: true,
      isInvalid: false,
    })
    this.promise = this.doLoad(event.target.value) || this.promise
  }

  load = (value: string): Promise<void> => {
    this.promise.cancel()
    return new Promise((resolve, reject) => {
      Cite.async(value).then(resolve).catch(reject)
    })
      .then((cite: Cite) => {
        this.setState({
          ...this.state,
          citation: cite.format('bibliography', {
            format: 'html',
            template: 'citation-apa',
            lang: 'de-DE',
          }),
          cslData: cite.get({
            format: 'real',
            type: 'json',
            style: 'csl',
          }),
          loading: false,
        })
      })
      .catch(() => {
        this.setState({
          ...this.state,
          citation: '',
          cslData: null,
          loading: false,
          isInvalid: true,
        })
      })
  }

  handleSubmit = (event: React.FormEvent<HTMLElement>): void => {
    event.preventDefault()
    const entry = new BibliographyEntry(
      this.state.cslData && this.state.cslData[0]
    )
    this.props.onSubmit(entry)
  }

  render(): JSX.Element {
    const parsed = new Parser().parse(this.state.citation)
    return (
      <>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId={'editor'}>
            <BibliographyHelp />
            <InputGroup>
              <Form.Control
                aria-label="Data"
                as="textarea"
                rows={this.state.value.split('\n').length}
                value={this.state.value}
                onChange={this.handleChange}
                isValid={this.isValid}
                isInvalid={this.isInvalid}
                disabled={this.props.disabled}
                className="BibliographyEntryForm__editor"
              />
              <Form.Control.Feedback type="invalid">
                Invalid entry
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Spinner loading={this.state.loading} />
          {parsed}
          <Button variant="primary" type="submit" disabled={this.isDisabled}>
            Save
          </Button>
        </Form>
      </>
    )
  }
}
