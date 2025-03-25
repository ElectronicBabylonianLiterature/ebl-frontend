import WordService from 'dictionary/application/WordService'
import EditableToken from 'fragmentarium/ui/fragment/lemmatizer2/EditableToken'
import React from 'react'
import AsyncSelect from 'react-select/async'
import {
  components,
  OptionProps,
  MultiValueProps,
  ActionMeta,
  ValueType,
} from 'react-select'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import InlineMarkdown from 'common/InlineMarkdown'

type Props = {
  token: EditableToken | null
  wordService: WordService
  onChange: (options: LemmaOption[] | null) => void
}
type State = {
  options: ValueType<LemmaOption, true>
  menuIsOpen?: boolean
}

const Option = (props: OptionProps<LemmaOption, true>): JSX.Element => (
  <components.Option {...props}>
    <InlineMarkdown source={props.label} />
  </components.Option>
)

const MultiValueLabel = (props: MultiValueProps<LemmaOption>): JSX.Element => (
  <components.MultiValueLabel {...props}>
    <InlineMarkdown source={props.data.label} />
  </components.MultiValueLabel>
)

export default class LemmaSelect extends React.Component<Props, State> {
  private token: EditableToken | null

  constructor(props: {
    token: EditableToken | null
    wordService: WordService
    onChange: (options: LemmaOption[] | null) => void
  }) {
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

  render(): JSX.Element {
    return (
      <AsyncSelect
        aria-label="edit-token-lemmas"
        autoFocus={true}
        isDisabled={!this.token?.isSelected}
        isClearable={false}
        isMulti={true}
        isSearchable={true}
        loadOptions={this.loadOptions}
        onChange={this.handleChange}
        menuIsOpen={this.state.menuIsOpen}
        value={this.state.options}
        placeholder={'---'}
        components={{ Option, MultiValueLabel }}
      />
    )
  }
}
