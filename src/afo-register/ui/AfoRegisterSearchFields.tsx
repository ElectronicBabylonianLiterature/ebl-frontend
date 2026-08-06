import React from 'react'
import _ from 'lodash'
import { Form } from 'react-bootstrap'
import Select from 'react-select'
import { AfoRegisterRecordSuggestion } from 'afo-register/domain/Record'
import AfoRegisterTextSelect from 'afo-register/ui/AfoRegisterTextSelect'

export type AfoRegisterQuery = { text: string; textNumber: string }

export interface TextNumberOption {
  label: string
  value: string
}

export interface TextOrPublicationSelectProps {
  query: AfoRegisterQuery
  setQuery: React.Dispatch<React.SetStateAction<AfoRegisterQuery>>
  searchTextSuggestions: (
    text: string,
  ) => Promise<readonly AfoRegisterRecordSuggestion[]>
  textNumberOptions: TextNumberOption[]
  setTextNumberOptions: React.Dispatch<React.SetStateAction<TextNumberOption[]>>
}

export function loadTextNumberOptions(
  textNumbers: readonly string[],
  setTextNumberOptions: React.Dispatch<
    React.SetStateAction<TextNumberOption[]>
  >,
): void {
  setTextNumberOptions([
    { label: '—', value: '' },
    ...textNumbers.map(makeTextNumberOption).filter((option) => option.label),
  ])
}

export function makeTextNumberOption(textNumber: string): TextNumberOption {
  return { label: textNumber, value: textNumber }
}

function makeTextSelectValue(
  query: AfoRegisterQuery,
  textNumberOptions: TextNumberOption[],
): AfoRegisterRecordSuggestion | null {
  return query.text
    ? new AfoRegisterRecordSuggestion({
        text: query.text,
        textNumbers: textNumberOptions.map((option) => option.value),
      })
    : null
}

export function TextOrPublicationSelect({
  query,
  setQuery,
  searchTextSuggestions,
  textNumberOptions,
  setTextNumberOptions,
}: TextOrPublicationSelectProps): JSX.Element {
  return (
    <AfoRegisterTextSelect
      ariaLabel={'Select text'}
      value={makeTextSelectValue(query, textNumberOptions)}
      onChange={(suggestion) => {
        loadTextNumberOptions(
          suggestion.textNumbers || [],
          setTextNumberOptions,
        )
        setQuery({ text: suggestion.text, textNumber: '' })
      }}
      searchSuggestions={searchTextSuggestions}
      isClearable={true}
    />
  )
}

export interface TextNumberFieldProps {
  query: AfoRegisterQuery
  setQuery: React.Dispatch<React.SetStateAction<AfoRegisterQuery>>
  textNumberOptions: TextNumberOption[]
  isTextNumberSelect: boolean
}

export function TextNumberField({
  query,
  setQuery,
  textNumberOptions,
  isTextNumberSelect,
}: TextNumberFieldProps): JSX.Element {
  return isTextNumberSelect ? (
    <Select
      aria-label="select-text-number"
      placeholder={'Number'}
      options={textNumberOptions}
      onChange={(option) => {
        if (option) {
          setQuery({ ...query, textNumber: option.value })
        }
      }}
      isSearchable={true}
      value={
        query.textNumber
          ? { value: query.textNumber, label: query.textNumber }
          : null
      }
    />
  ) : (
    <Form.Control
      aria-label="input-text-number"
      placeholder="Number"
      value={query.textNumber}
      onChange={(event) => {
        setQuery({ ...query, textNumber: event.target.value })
      }}
    />
  )
}

export interface TextNumberExactSwitchProps {
  isTextNumberSelect: boolean
  setIsTextNumberSelect: React.Dispatch<React.SetStateAction<boolean>>
}

export function TextNumberExactSwitch({
  isTextNumberSelect,
  setIsTextNumberSelect,
}: TextNumberExactSwitchProps): JSX.Element {
  return (
    <Form.Switch
      className="settings__switch"
      label={'Exact number'}
      id={_.uniqueId('text-number-field-toggle-')}
      onChange={() => setIsTextNumberSelect(!isTextNumberSelect)}
      checked={isTextNumberSelect}
    />
  )
}
