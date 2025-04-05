import WordService from 'dictionary/application/WordService'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import React from 'react'
import AsyncSelect from 'react-select/async'
import { ActionMeta, ValueType } from 'react-select'
import {
  LemmaOption,
  Option,
  MultiValueLabel,
} from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'

type Props = {
  token: EditableToken | null
  wordService: WordService
  onChange: (options: LemmaOption[] | null) => void
  onTab: () => void
  onShiftTab: () => void
}
type State = {
  options: ValueType<LemmaOption, true>
  menuIsOpen?: boolean
}

export default class LemmaAnnotationForm extends React.Component<Props, State> {
  private token: EditableToken | null

  constructor(props: Props) {
    super(props)

    this.token = props.token

    this.state = {
      options: this.token?.lemmas,
      menuIsOpen: undefined,
    }
  }

  loadOptions = (
    inputValue: string,
    callback: (lemmas: LemmaOption[]) => void
  ): void => {
    this.props.wordService
      .searchLemma(inputValue)
      .then((words) => words.map((word) => new LemmaOption(word)))
      .then(callback)
  }

  handleChange = (
    options: ValueType<LemmaOption, true>,
    { action, removedValue }: ActionMeta<LemmaOption>
  ): void => {
    const current = this.state.options || []

    const update =
      action === 'remove-value'
        ? current.filter((option) => option.id !== removedValue?.id)
        : options

    this.setState({
      ...this.state,
      options: update,
    })

    this.props.onChange((update as LemmaOption[]) || null)
  }

  handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.code === 'Tab') {
      event.preventDefault()
      if (event.shiftKey) {
        this.props.onTab()
      } else {
        this.props.onShiftTab()
      }
    }
  }

  render(): JSX.Element {
    return (
      <AsyncSelect
        aria-label="edit-token-lemmas"
        className="lemmatizer__editor__lemma-select"
        autoFocus={true}
        isDisabled={!this.token?.isSelected}
        isClearable={false}
        isMulti={true}
        isSearchable={true}
        loadOptions={this.loadOptions}
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
        menuIsOpen={this.state.menuIsOpen}
        value={this.state.options}
        placeholder={'---'}
        components={{ Option, MultiValueLabel }}
      />
    )
  }
}
