import React, { Component } from 'react'
import AsyncSelect from 'react-select/async'
import Lemma from 'transliteration/domain/Lemma'
import Word from 'dictionary/domain/Word'
import InlineMarkdown from 'common/ui/InlineMarkdown'
import {
  createLemmaOptionsLoader,
  LemmaOption,
} from 'fragmentarium/ui/lemmatization/lemmaOptions'
import { components } from 'react-select'
import type {
  OptionProps,
  MultiValueGenericProps,
  ActionMeta,
  MultiValue,
} from 'react-select'

export { LemmaOption }

export function Option<Selected extends Lemma = LemmaOption>(
  props: OptionProps<Selected, true>,
): JSX.Element {
  return (
    <components.Option {...props}>
      <InlineMarkdown source={props.label} />
    </components.Option>
  )
}

export function MultiValueLabel<Selected extends Lemma = LemmaOption>(
  props: MultiValueGenericProps<Selected, true>,
): JSX.Element {
  return (
    <components.MultiValueLabel {...props}>
      <InlineMarkdown source={props.data.label} />
    </components.MultiValueLabel>
  )
}

type Props = {
  query?: readonly LemmaOption[]
  onChange: (query: readonly LemmaOption[]) => void
  wordService: { searchLemma(query: string): Promise<readonly Word[]> }
}
type State = {
  query: MultiValue<LemmaOption>
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
    createLemmaOptionsLoader(this.props.wordService, undefined)(
      inputValue,
      callback,
    )
  }

  handleChange = (
    query: MultiValue<LemmaOption>,
    { action, removedValue }: ActionMeta<LemmaOption>,
  ): void => {
    const update =
      action === 'remove-value'
        ? this.state.query.filter((option) => option.id !== removedValue?.id)
        : query

    this.setState({
      ...this.state,
      query: update,
    })
    this.props.onChange(update)
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
        className="SearchForm__select"
        classNamePrefix="search-form-select"
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
