import React, { useEffect, useState } from 'react'
import AsyncSelect from 'react-select/async'
import { usePrevious } from 'common/usePrevious'
import DossierRecord from 'dossiers/domain/DossierRecord'

interface SelectedOption {
  value: string
  label: string
  entry: DossierRecord
}
function createOption(
  entry?: Partial<DossierRecord> | null,
): SelectedOption | null {
  if (!entry || entry.id == null) return null
  const description = (entry as Partial<DossierRecord>).description ?? ''
  return {
    value: String(entry.id),
    label: `${entry.id} — ${description}`,
    entry: entry as DossierRecord,
  }
}

interface Props {
  ariaLabel: string
  value: DossierRecord | null
  searchDossier: (query: string) => Promise<readonly DossierRecord[]>
  onChange: (dossier: DossierRecord | null) => void
  isClearable?: boolean
}

const collator = new Intl.Collator([], { numeric: true })

export default function SearchFormDossier({
  ariaLabel,
  value,
  searchDossier,
  onChange,
  isClearable = true,
}: Props): JSX.Element {
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(
    createOption(value ?? undefined),
  )
  const prevValue = usePrevious(value)

  useEffect(() => {
    if (value !== prevValue) {
      setSelectedOption(createOption(value ?? undefined))
    }
  }, [value, prevValue])

  const loadOptions = (
    inputValue: string,
    callback: (options: SelectedOption[]) => void,
  ) => {
    if (!inputValue) {
      callback([])
      return
    }
    searchDossier(inputValue)
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
      onChange(option.entry)
    } else {
      setSelectedOption(null)
      onChange(null)
    }
  }

  return (
    <AsyncSelect
      isClearable={isClearable}
      aria-label={ariaLabel}
      placeholder="ID — Description"
      cacheOptions
      loadOptions={loadOptions}
      onChange={handleChange}
      value={selectedOption}
    />
  )
}
