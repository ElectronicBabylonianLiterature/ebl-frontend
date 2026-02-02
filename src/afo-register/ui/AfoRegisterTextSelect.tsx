import React, { useEffect, useState } from 'react'
import { AfoRegisterRecordSuggestion } from 'afo-register/domain/Record'
import { usePrevious } from 'common/usePrevious'
import type { SingleValue } from 'react-select'
import AsyncSelect from 'react-select/async'
import { Markdown } from 'common/Markdown'

interface SelectProps {
  ariaLabel: string
  value: AfoRegisterRecordSuggestion | null
  searchSuggestions: (
    query: string,
  ) => Promise<readonly AfoRegisterRecordSuggestion[]>
  onChange: (event: AfoRegisterRecordSuggestion) => void
  isClearable: boolean
}

interface TextSuggestionOption {
  value: string
  label: string | JSX.Element
  entry: AfoRegisterRecordSuggestion
}

const collator = new Intl.Collator([], { numeric: true })
function sorter(a: string, b: string, inputValue: string) {
  const removeSpecialChars = /[*^]/g
  const cleanedA = a.replace(removeSpecialChars, '')
  const cleanedB = b.replace(removeSpecialChars, '')
  const regex = new RegExp(`^${inputValue}`, 'i')
  const startsWithQueryA = regex.test(cleanedA)
  const startsWithQueryB = regex.test(cleanedB)
  if (startsWithQueryA === startsWithQueryB) {
    return collator.compare(cleanedA, cleanedB)
  }
  return startsWithQueryA ? -1 : 1
}

function createOption(
  recordSuggestion: AfoRegisterRecordSuggestion,
): TextSuggestionOption {
  return {
    value: recordSuggestion.text,
    label: recordSuggestion.text,
    entry: recordSuggestion,
  }
}

export default function AfoRegisterTextSelect({
  ariaLabel,
  value,
  searchSuggestions,
  onChange,
  isClearable,
}: SelectProps): JSX.Element {
  const [selectedOption, setSelectedOption] =
    useState<TextSuggestionOption | null>(value ? createOption(value) : null)
  const prevValue = usePrevious(value)

  useEffect(() => {
    if (value && value !== prevValue) {
      setSelectedOption(createOption(value))
    }
  }, [value, prevValue])

  const loadOptions = (
    inputValue: string,
    callback: (options: TextSuggestionOption[]) => void,
  ) => {
    searchSuggestions(inputValue).then((entries) => {
      const options = entries
        .map(createOption)
        .filter((option) => option !== null) as TextSuggestionOption[]
      options.sort((a, b) => sorter(a.value, b.value, inputValue))
      callback(options)
    })
  }

  const handleChange = (selectedOption: SingleValue<TextSuggestionOption>) => {
    if (selectedOption) {
      setSelectedOption(selectedOption)
      onChange(selectedOption.entry)
    } else {
      setSelectedOption(null)
      onChange(new AfoRegisterRecordSuggestion({ text: '', textNumbers: [] }))
    }
  }

  function formatOptionLabel(option: TextSuggestionOption): JSX.Element {
    return <Markdown text={option.label as string} />
  }

  return (
    <AsyncSelect
      isClearable={isClearable}
      aria-label={ariaLabel}
      placeholder="Text or Publication"
      cacheOptions
      loadOptions={loadOptions}
      onChange={handleChange}
      value={selectedOption}
      formatOptionLabel={formatOptionLabel}
    />
  )
}
