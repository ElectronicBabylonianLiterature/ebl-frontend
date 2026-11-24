import WordService from 'dictionary/application/WordService'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import React from 'react'
import _ from 'lodash'
import type { ActionMeta, OnChangeValue } from 'react-select'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import LemmaSelect, {
  getTokenLanguage,
  searchLemmaOptions,
} from 'fragmentarium/ui/lemmatization/LemmaSelect'

type Props = {
  token: EditableToken | null
  wordService: WordService
  onChange: (options: LemmaOption[] | null) => void
  onTab: () => void
  onShiftTab: () => void
}
type State = {
  options: OnChangeValue<LemmaOption, true>
  menuIsOpen?: boolean
}

export default class LemmaAnnotationForm extends React.Component<Props, State> {
  private token: EditableToken | null
  private readonly inputId: string

  constructor(props: Props) {
    super(props)

    this.token = props.token
    this.inputId = _.uniqueId('lemmatizer-lemma-')

    this.state = {
      options: this.token?.lemmas ?? [],
      menuIsOpen: undefined,
    }
  }

  loadOptions = (
    inputValue: string,
    callback: (lemmas: LemmaOption[]) => void,
  ): void => {
    searchLemmaOptions(
      this.props.wordService,
      inputValue,
      getTokenLanguage(this.props.token?.token),
    ).then(callback)
  }

  handleChange = (
    options: OnChangeValue<LemmaOption, true>,
    { action, removedValue }: ActionMeta<LemmaOption>,
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

  componentDidUpdate(): void {
    const tokenLemmas = this.props.token?.lemmas ?? []

    if (!_.isEqual(this.state.options, tokenLemmas)) {
      this.setState({
        options: tokenLemmas,
      })
    }
  }

  render(): JSX.Element {
    return (
      <LemmaSelect
        ariaLabel="edit-token-lemmas"
        inputId={this.inputId}
        value={this.state.options}
        autoFocus={true}
        isDisabled={!this.token?.isSelected}
        loadOptions={this.loadOptions}
        onChange={this.handleChange}
        onTab={this.props.onTab}
        onShiftTab={this.props.onShiftTab}
      />
    )
  }
}
