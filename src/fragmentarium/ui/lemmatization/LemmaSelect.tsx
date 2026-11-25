import React from 'react'
import AsyncSelect from 'react-select/async'
import type { ActionMeta, OnChangeValue } from 'react-select'
import {
  MultiValueLabel,
  Option,
} from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import Lemma from 'transliteration/domain/Lemma'
import { Token } from 'transliteration/domain/token'

interface Props<Selected extends Lemma> {
  readonly ariaLabel: string
  readonly inputId: string
  readonly value: OnChangeValue<Selected, true>
  readonly defaultOptions?: readonly Selected[]
  readonly autoFocus: boolean
  readonly blurInputOnSelect?: boolean
  readonly isDisabled: boolean
  readonly loadOptions: (
    inputValue: string,
    callback: (lemmas: Selected[]) => void,
  ) => void
  readonly onChange: (
    options: OnChangeValue<Selected, true>,
    meta: ActionMeta<Selected>,
  ) => void
  readonly onTab: () => void
  readonly onShiftTab: () => void
}

export function getTokenLanguage(token: Token | undefined): string | undefined {
  return token && 'language' in token ? token.language : undefined
}

export default function LemmaSelect<Selected extends Lemma>({
  ariaLabel,
  inputId,
  value,
  defaultOptions,
  autoFocus,
  blurInputOnSelect,
  isDisabled,
  loadOptions,
  onChange,
  onTab,
  onShiftTab,
}: Props<Selected>): JSX.Element {
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.code === 'Tab') {
      event.preventDefault()
      if (event.shiftKey) {
        onShiftTab()
      } else {
        onTab()
      }
    }
  }

  return (
    <AsyncSelect
      aria-label={ariaLabel}
      inputId={inputId}
      name={inputId}
      className="lemmatizer__editor__lemma-select"
      autoFocus={autoFocus}
      blurInputOnSelect={blurInputOnSelect}
      isDisabled={isDisabled}
      isClearable={false}
      isMulti={true}
      isSearchable={true}
      loadOptions={loadOptions}
      defaultOptions={defaultOptions}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      value={value}
      placeholder={'---'}
      components={{ Option, MultiValueLabel }}
    />
  )
}
