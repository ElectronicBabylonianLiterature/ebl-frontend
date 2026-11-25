import React from 'react'
import AsyncSelect from 'react-select/async'
import type { ActionMeta, OnChangeValue } from 'react-select'
import Word from 'dictionary/domain/Word'
import {
  LemmaOption,
  MultiValueLabel,
  Option,
} from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import Lemma from 'transliteration/domain/Lemma'
import { Token } from 'transliteration/domain/token'

export interface LemmaSearch {
  searchLemma(query: string): Promise<readonly Word[]>
}

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

const namedEntityLanguages: readonly string[] = ['SUMERIAN', 'EMESAL']

function isNamedEntityLanguage(language: string | undefined): boolean {
  return language !== undefined && namedEntityLanguages.includes(language)
}

function isNamedEntity(word: Word): boolean {
  return (word.namedEntityTags ?? []).length > 0
}

export function getTokenLanguage(token: Token | undefined): string | undefined {
  return token && 'language' in token ? token.language : undefined
}

export function searchLemmaOptions(
  search: LemmaSearch,
  inputValue: string,
  language: string | undefined,
): Promise<LemmaOption[]> {
  return search
    .searchLemma(inputValue)
    .then((words) =>
      isNamedEntityLanguage(language) ? words.filter(isNamedEntity) : words,
    )
    .then((words) => words.map((word) => new LemmaOption(word)))
}

export function createLemmaOptionsLoader(
  search: LemmaSearch,
  language: string | undefined,
): (inputValue: string, callback: (lemmas: LemmaOption[]) => void) => void {
  return (inputValue, callback): void => {
    searchLemmaOptions(search, inputValue, language)
      .then(callback)
      .catch(() => callback([]))
  }
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
