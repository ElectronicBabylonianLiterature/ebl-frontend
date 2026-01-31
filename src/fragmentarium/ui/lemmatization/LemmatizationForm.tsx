import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import AsyncSelect from 'react-select/async'
import _ from 'lodash'
import Lemma from 'transliteration/domain/Lemma'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import Promise from 'bluebird'
import Word from 'dictionary/domain/Word'
import InlineMarkdown from 'common/InlineMarkdown'
import {
  ValueType,
  OptionsType,
  components,
  OptionProps,
  SingleValueProps,
  MultiValueProps,
} from 'react-select'

const Option = (
  props: OptionProps<Lemma, true> | OptionProps<Lemma, false>,
): JSX.Element => (
  <components.Option {...props}>
    <InlineMarkdown source={props.label} />
  </components.Option>
)

const MultiValueLabel = (props: MultiValueProps<Lemma>): JSX.Element => (
  <components.MultiValueLabel {...props}>
    <InlineMarkdown source={props.data.label} />
  </components.MultiValueLabel>
)

const SingleValue = (props: SingleValueProps<Lemma>): JSX.Element => (
  <components.SingleValue {...props}>
    <InlineMarkdown source={props.data.label} />
  </components.SingleValue>
)

type Props = {
  token: LemmatizationToken
  onChange: (selected: readonly Lemma[]) => void
  fragmentService: { searchLemma(query: string): Promise<readonly Word[]> }
}
type State = {
  isComplex: boolean
  selectedOption: ValueType<Lemma, true> | ValueType<Lemma, false>
  menuIsOpen: boolean | undefined
}

class LemmatizationForm extends Component<Props, State> {
  private readonly checkboxId: string

  constructor(props: Props) {
    super(props)
    const isComplex = (props.token.uniqueLemma?.length ?? 0) > 1
    const singleLemmaToOption = (): Lemma | null =>
      (props.token.uniqueLemma?.length ?? 0) === 1
        ? (props.token.uniqueLemma?.[0] ?? null)
        : null

    this.state = {
      isComplex: isComplex,
      selectedOption: isComplex
        ? props.token.uniqueLemma
        : singleLemmaToOption(),
      menuIsOpen: (props.token.suggestions?.length ?? 0) > 0 || undefined,
    }
    this.checkboxId = _.uniqueId('LemmatizationForm-Complex-')
  }

  loadOptions = (
    inputValue: string,
    callback: (lemmas: Lemma[]) => void,
  ): void => {
    this.props.fragmentService
      .searchLemma(inputValue)
      .then((words) => words.map((word) => new Lemma(word)))
      .then(callback)
  }

  handleChange = (
    selectedOption: ValueType<Lemma, true> | ValueType<Lemma, false>,
  ): void => {
    this.setState({
      ...this.state,
      selectedOption,
    })
    this.props.onChange(
      _.isNil(selectedOption)
        ? []
        : _.isArray(selectedOption)
          ? selectedOption
          : [selectedOption as Lemma],
    )
  }

  onInputChange = (
    inputValue: unknown,
    { action }: { action: string },
  ): void => {
    if (action === 'menu-close') {
      this.setState({
        ...this.state,
        menuIsOpen: undefined,
      })
    }
  }

  Select = ({ label }: { label: string }): JSX.Element => {
    const defaultOptions: OptionsType<Lemma> = this.state.isComplex
      ? _(this.props.token.suggestions).flatMap().uniqBy('value').value()
      : _.isArray(this.props.token.suggestions)
        ? (this.props.token.suggestions
            .filter((suggestion) => suggestion.length === 1)
            .map(_.head) as Lemma[])
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
        components={{ Option, MultiValueLabel, SingleValue }}
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
            isComplex: !this.state.isComplex,
          })
        }
      />
    </Form.Group>
  )

  render(): JSX.Element {
    const label = this.state.isComplex ? 'Lemmata' : 'Lemma'
    return (
      <Form className="WordLemmatizer__form">
        <Row>
          <Col md={9}>
            <this.Select label={label} />
          </Col>
          <Col md={3}>
            <this.Checkbox />
          </Col>
        </Row>
      </Form>
    )
  }
}

export default LemmatizationForm
