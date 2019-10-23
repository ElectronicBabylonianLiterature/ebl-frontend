import React, { Component } from 'react'
import { Col, Form } from 'react-bootstrap'
import AsyncSelect from 'react-select/async'
import _ from 'lodash'
import Lemma from 'fragmentarium/domain/Lemma'
import { LemmatizationToken } from 'fragmentarium/domain/Lemmatization'

type Props = {token: LemmatizationToken; onChange; fragmentService}
type State = {
  isComplex: boolean;
  selectedOption: Lemma[] | Lemma | null;
  menuIsOpen: boolean | undefined;
}

class LemmatizationForm extends Component<Props, State> {
  private readonly checkboxId: string

  constructor(props) {
    super(props)
    const isComplex = props.token.uniqueLemma.length > 1
    const singleLemmaToOption = () =>
      props.token.uniqueLemma.length === 1 ? props.token.uniqueLemma[0] : null

    this.state = {
      isComplex: isComplex,
      selectedOption: isComplex
        ? props.token.uniqueLemma
        : singleLemmaToOption(),
      menuIsOpen:
        (_.isArray(props.token.suggestions) &&
          props.token.suggestions.length > 0) ||
        undefined
    }
    this.checkboxId = _.uniqueId('LemmatizationForm-Complex-')
  }

  loadOptions = (inputValue, callback) => {
    this.props.fragmentService
      .searchLemma(inputValue)
      .then(words => words.map(word => new Lemma(word)))
      .then(callback)
  }

  handleChange = selectedOption => {
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

  onInputChange = (inputValue, { action }) => {
    if (action === 'menu-close') {
      this.setState({
        ...this.state,
        menuIsOpen: undefined
      })
    }
  }

  Select = ({ label }) => {
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

  Checkbox = () => (
    <Form.Group controlId={this.checkboxId}>
      <Form.Check
        type="checkbox"
        label="Complex"
        disabled={!!this.props.token.uniqueLemma && this.props.token.uniqueLemma.length > 1}
        checked={this.state.isComplex}
        onChange={() =>
          this.setState({
            ...this.state,
            isComplex: !this.state.isComplex
          })
        }
      />
    </Form.Group>
  )

  render() {
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
