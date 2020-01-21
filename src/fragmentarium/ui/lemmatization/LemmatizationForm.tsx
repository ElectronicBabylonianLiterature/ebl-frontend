import React, { Component } from 'react'
import { Col, Form } from 'react-bootstrap'
import AsyncSelect from 'react-select/async'
import _ from 'lodash'
import Lemma from 'fragmentarium/domain/Lemma'
import { LemmatizationToken } from 'fragmentarium/domain/Lemmatization'
import Promise from 'bluebird'
import Word from 'dictionary/domain/Word'

type Props = {
  token: LemmatizationToken
  onChange: (selected: readonly Lemma[]) => void
  fragmentService: { searchLemma(query: string): Promise<readonly Word[]> }
}
type State = {
  isComplex: boolean
  selectedOption: readonly Lemma[] | Lemma | null
  menuIsOpen: boolean | undefined
}

class LemmatizationForm extends Component<Props, State> {
  private readonly checkboxId: string

  constructor(props: Props) {
    super(props)
    const isComplex = (props.token.uniqueLemma?.length ?? 0) > 1
    const singleLemmaToOption = (): Lemma | null =>
      (props.token.uniqueLemma?.length ?? 0) === 1
        ? props.token.uniqueLemma?.[0] ?? null
        : null

    this.state = {
      isComplex: isComplex,
      selectedOption: isComplex
        ? props.token.uniqueLemma
        : singleLemmaToOption(),
      menuIsOpen: (props.token.suggestions?.length ?? 0) > 0 || undefined
    }
    this.checkboxId = _.uniqueId('LemmatizationForm-Complex-')
  }

  loadOptions = (
    inputValue: string,
    callback: (lemmas: Lemma[]) => void
  ): void => {
    this.props.fragmentService
      .searchLemma(inputValue)
      .then(words => words.map(word => new Lemma(word)))
      .then(callback)
  }

  handleChange = (selectedOption: Lemma[] | Lemma | null): void => {
    this.setState({
      ...this.state,
      selectedOption
    })
    this.props.onChange(
      _.isNil(selectedOption)
        ? []
        : _.isArray(selectedOption)
        ? selectedOption
        : [selectedOption]
    )
  }

  onInputChange = (
    inputValue: unknown,
    { action }: { action: string }
  ): void => {
    if (action === 'menu-close') {
      this.setState({
        ...this.state,
        menuIsOpen: undefined
      })
    }
  }

  Select = ({ label }: { label: string }): JSX.Element => {
    const defaultOptions = this.state.isComplex
      ? _(this.props.token.suggestions)
          .flatMap()
          .uniqBy('value')
          .value()
      : _.isArray(this.props.token.suggestions)
      ? this.props.token.suggestions
          .filter(suggestion => suggestion.length === 1)
          .map(_.head)
      : []

    return (
      <AsyncSelect
        aria-label={label}
        placeholder={label}
        cacheOptions
        isClearable
        autoFocus={process.env.NODE_ENV !== 'test'}
        loadOptions={this.loadOptions}
        defaultOptions={defaultOptions}
        onInputChange={this.onInputChange}
        menuIsOpen={this.state.menuIsOpen}
        onChange={this.handleChange}
        value={this.state.selectedOption}
        isMulti={this.state.isComplex}
      />
    )
  }

  Checkbox = (): JSX.Element => (
    <Form.Group controlId={this.checkboxId}>
      <Form.Check
        type="checkbox"
        label="Complex"
        disabled={
          !!this.props.token.uniqueLemma &&
          this.props.token.uniqueLemma.length > 1
        }
        checked={this.state.isComplex}
        onChange={(): void =>
          this.setState({
            ...this.state,
            isComplex: !this.state.isComplex
          })
        }
      />
    </Form.Group>
  )

  render(): JSX.Element {
    const label = this.state.isComplex ? 'Lemmata' : 'Lemma'
    return (
      <Form>
        <Form.Row>
          <Col md={9}>
            <this.Select label={label} />
          </Col>
          <Col md={3}>
            <this.Checkbox />
          </Col>
        </Form.Row>
      </Form>
    )
  }
}

export default LemmatizationForm
