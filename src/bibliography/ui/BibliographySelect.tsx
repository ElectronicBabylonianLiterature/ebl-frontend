import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import React, { useEffect, useState } from 'react'
import AsyncSelect from 'react-select/async'
import { usePrevious } from 'common/usePrevious'
import Promise from 'bluebird'

interface SelectedOption {
  value: string
  label: string
  entry: BibliographyEntryPartial
}
function createOption(entry: BibliographyEntryPartial): SelectedOption | null {
  return entry && entry.id
    ? {
        value: entry.id,
        label: entry.label,
        entry: entry,
      }
    : null
}
interface BibliographyEntryPartial extends Partial<BibliographyEntry> {
  label: string
}

interface Props {
  ariaLabel: string
  value: BibliographyEntryPartial
  searchBibliography: (query: string) => Promise<readonly BibliographyEntry[]>
  onChange: (event: BibliographyEntry) => void
  isClearable: boolean
}

const collator = new Intl.Collator([], { numeric: true })

export default function BibliographySelect({
  ariaLabel,
  value,
  searchBibliography,
  onChange,
  isClearable,
}: Props): JSX.Element {
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(
    createOption(value),
  )
  const prevValue = usePrevious(value)

  useEffect(() => {
    if (value !== prevValue) {
      setSelectedOption(createOption(value))
    }
  }, [value, prevValue])

  const loadOptions = (
    inputValue: string,
    callback: (options: SelectedOption[]) => void,
  ) => {
    searchBibliography(inputValue).then((entries) => {
      const options = entries
        .map(createOption)
        .filter((option) => option !== null) as SelectedOption[]
      options.sort((a, b) => collator.compare(a.label, b.label))
      callback(options)
    })
  }

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedOption(selectedOption)
      onChange(selectedOption.entry)
    } else {
      onChange(new BibliographyEntry())
    }
  }

  return (
    <>
      <AsyncSelect
        isClearable={isClearable}
        aria-label={ariaLabel}
        placeholder="Name Year Title"
        cacheOptions
        loadOptions={loadOptions}
        onChange={handleChange}
        value={selectedOption}
      />
    </>
  )
}
