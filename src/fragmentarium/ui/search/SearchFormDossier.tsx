import React, { useEffect, useState } from 'react'
import AsyncSelect from 'react-select/async'
import { usePrevious } from 'common/usePrevious'
import { DossierRecordSuggestion } from 'dossiers/domain/DossierRecord'

interface SelectedOption {
  value: string
  label: string
}

function createOption(
  entry?: DossierRecordSuggestion | null,
): SelectedOption | null {
  if (!entry || entry.id == null) return null
  const description = entry.description ?? ''
  return {
    value: String(entry.id),
    label: `${entry.id} — ${description}`,
  }
}

interface Props {
  ariaLabel: string
  value: string | null
  searchSuggestions: (
    query: string,
  ) => Promise<readonly DossierRecordSuggestion[]>
  onChange: (dossierId: string | null) => void
  isClearable?: boolean
}

const collator = new Intl.Collator([], { numeric: true })

export default function SearchFormDossier({
  ariaLabel,
  value,
  searchSuggestions,
  onChange,
  isClearable = true,
}: Props): JSX.Element {
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(
    value ? { value, label: value } : null,
  )
  const prevValue = usePrevious(value)

  useEffect(() => {
    if (value !== prevValue) {
      setSelectedOption(value ? { value, label: value } : null)
    }
  }, [value, prevValue])

  const loadOptions = (
    inputValue: string,
    callback: (options: SelectedOption[]) => void,
  ) => {
    searchSuggestions(inputValue || '')
      .then((entries) => {
        const options = entries
          .map(createOption)
          .filter((o): o is SelectedOption => o !== null)
        options.sort((a, b) => collator.compare(a.label, b.label))
        callback(options)
      })
      .catch(() => callback([]))
  }

  const handleChange = (option: SelectedOption | null | undefined) => {
    if (option) {
      setSelectedOption(option)
      onChange(option.value)
    } else {
      setSelectedOption(null)
      onChange(null)
    }
  }

  return (
    <AsyncSelect
      isClearable={isClearable}
      aria-label={ariaLabel}
      placeholder="Dossiers"
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      onChange={handleChange}
      value={selectedOption}
    />
  )
}
