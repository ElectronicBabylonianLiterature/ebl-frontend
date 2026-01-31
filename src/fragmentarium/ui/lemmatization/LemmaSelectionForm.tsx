import React, { Component } from 'react'
import AsyncSelect from 'react-select/async'
import _ from 'lodash'
import Lemma from 'transliteration/domain/Lemma'
import Promise from 'bluebird'
import Word from 'dictionary/domain/Word'
import InlineMarkdown from 'common/InlineMarkdown'
import {
  ValueType,
  components,
  OptionProps,
  MultiValueProps,
  ActionMeta,
} from 'react-select'

export class LemmaOption extends Lemma {
  readonly id?: string
  word: Word
  isSuggestion?: boolean

  constructor(word: Word, isSuggestion = false) {
    super(word)
    this.word = word
    this.id = _.uniqueId('lemmaoption-')
    this.isSuggestion = isSuggestion
  }

  unsetSuggestion = (): LemmaOption => {
    return new LemmaOption(this.word)
  }
}

export const Option = (props: OptionProps<LemmaOption, true>): JSX.Element => (
  <components.Option {...props}>
    <InlineMarkdown source={props.label} />
  </components.Option>
)

export const MultiValueLabel = (
  props: MultiValueProps<LemmaOption>,
): JSX.Element => (
  <components.MultiValueLabel {...props}>
    <InlineMarkdown source={props.data.label} />
  </components.MultiValueLabel>
)

type Props = {
  query?: readonly LemmaOption[]
  onChange: (query: readonly LemmaOption[]) => void
  wordService: { searchLemma(query: string): Promise<readonly Word[]> }
}
type State = {
  query: ValueType<LemmaOption, true>
  menuIsOpen: boolean | undefined
}

class LemmaSelectionForm extends Component<Props, State> {
  private readonly query: readonly LemmaOption[]

  constructor(props: Props) {
    super(props)
    this.query = props.query || []

    this.state = {
      query: this.query,
      menuIsOpen: undefined,
    }
  }

  loadOptions = (
    inputValue: string,
    callback: (lemmas: LemmaOption[]) => void,
  ): void => {
    this.props.wordService
      .searchLemma(inputValue)
      .then((words) => words.map((word) => new LemmaOption(word)))
      .then(callback)
  }

  handleChange = (
    query: ValueType<LemmaOption, true>,
    { action, removedValue }: ActionMeta<LemmaOption>,
  ): void => {
    const current = this.state.query || []

    const update =
      action === 'remove-value'
        ? current.filter((option) => option.id !== removedValue?.id)
        : query

    this.setState({
      ...this.state,
      query: update,
    })
    this.props.onChange(_.isNil(update) ? [] : update)
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
    return (
      <AsyncSelect
        aria-label={'Select lemmata'}
        placeholder={label}
        isClearable
        loadOptions={this.loadOptions}
        onInputChange={this.onInputChange}
        menuIsOpen={this.state.menuIsOpen}
        onChange={this.handleChange}
        value={this.state.query}
        isMulti={true}
        components={{ Option, MultiValueLabel }}
        isOptionSelected={() => false}
      />
    )
  }

  render(): JSX.Element {
    return <this.Select label={'Lemmata'} />
  }
}

export default LemmaSelectionForm
