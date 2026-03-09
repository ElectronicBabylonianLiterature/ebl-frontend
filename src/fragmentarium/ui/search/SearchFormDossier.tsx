import React, { useEffect, useState } from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import AsyncSelect from 'react-select/async'
import { usePrevious } from 'common/usePrevious'
import { DossierRecordSuggestion } from 'dossiers/domain/DossierRecord'
import { HelpCol, DossierSearchHelp } from 'fragmentarium/ui/SearchHelp'
import { helpColSize } from 'fragmentarium/ui/SearchForm'

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
    filters?: {
      provenance?: string | null
      scriptPeriod?: string | null
      genre?: string | null
    },
  ) => Promise<readonly DossierRecordSuggestion[]>
  onChange: (dossierId: string | null) => void
  isClearable?: boolean
  filters?: {
    provenance?: string | null
    scriptPeriod?: string | null
    genre?: string | null
  }
}

const collator = new Intl.Collator([], { numeric: true })

export default function SearchFormDossier({
  ariaLabel,
  value,
  searchSuggestions,
  onChange,
  isClearable = true,
  filters,
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
    const result = searchSuggestions(inputValue || '', filters)
    if (!result || typeof result.then !== 'function') {
      callback([])
      return
    }
    result
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
    <Form.Group as={Row} controlId="dossier" data-testid="dossier-form-group">
      <HelpCol overlay={DossierSearchHelp()} />
      <Col sm={12 - helpColSize}>
        <AsyncSelect
          key={JSON.stringify(filters)}
          isClearable={isClearable}
          aria-label={ariaLabel}
          placeholder="Dossiers"
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          onChange={handleChange}
          value={selectedOption}
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        />
      </Col>
    </Form.Group>
  )
}
