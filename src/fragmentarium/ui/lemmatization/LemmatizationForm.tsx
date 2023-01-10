import React, { Component } from 'react'
import AsyncSelect from 'react-select/async'
import _ from 'lodash'
import Lemma from 'transliteration/domain/Lemma'
import { UniqueLemma } from 'transliteration/domain/Lemmatization'
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
  props: OptionProps<Lemma, true> | OptionProps<Lemma, false>
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
  uniqueLemma?: UniqueLemma | null
  suggestions?: readonly UniqueLemma[] | null
  onChange: (selected: readonly Lemma[]) => void
  fragmentService: { searchLemma(query: string): Promise<readonly Word[]> }
  isMulti: boolean
}
type State = {
  selectedOption: ValueType<Lemma, true> | ValueType<Lemma, false>
  menuIsOpen: boolean | undefined
}

class LemmatizationForm extends Component<Props, State> {
  private readonly uniqueLemma: UniqueLemma
  private readonly suggestions: UniqueLemma[]

  constructor(props: Props) {
    super(props)
    this.uniqueLemma = props.uniqueLemma || []
    this.suggestions = [...(props.suggestions || [])]

    const isMulti = this.uniqueLemma.length > 1 || this.props.isMulti
    const singleLemmaToOption = (): Lemma | null =>
      this.uniqueLemma.length === 1 ? this.uniqueLemma[0] : null

    this.state = {
      selectedOption: isMulti ? this.uniqueLemma : singleLemmaToOption(),
      menuIsOpen: this.suggestions.length > 0 || undefined,
    }
  }

  loadOptions = (
    inputValue: string,
    callback: (lemmas: Lemma[]) => void
  ): void => {
    this.props.fragmentService
      .searchLemma(inputValue)
      .then((words) => words.map((word) => new Lemma(word)))
      .then(callback)
  }

  handleChange = (
    selectedOption: ValueType<Lemma, true> | ValueType<Lemma, false>
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
        : [selectedOption as Lemma]
    )
  }

  onInputChange = (
    inputValue: unknown,
    { action }: { action: string }
  ): void => {
    if (action === 'menu-close') {
      this.setState({
        ...this.state,
        menuIsOpen: undefined,
      })
    }
  }

  Select = ({ label }: { label: string }): JSX.Element => {
    const defaultOptions: OptionsType<Lemma> = this.props.isMulti
      ? _(this.suggestions).flatMap().uniqBy('value').value()
      : (this.suggestions
          .filter((suggestion) => suggestion.length === 1)
          .map(_.head) as Lemma[])

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
        isMulti={this.props.isMulti}
        components={{ Option, MultiValueLabel, SingleValue }}
      />
    )
  }

  render(): JSX.Element {
    const label = this.props.isMulti ? 'Lemmata' : 'Lemma'
    return <this.Select label={label} />
  }
}

export default LemmatizationForm
