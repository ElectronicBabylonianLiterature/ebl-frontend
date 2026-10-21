import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import {
  SumerianSourceFilter,
  SumerianWordKind,
} from 'sumerian-dictionary/domain/SumerianWordSummary'
import {
  getSumerianSearchUrl,
  SumerianSearchState,
} from 'sumerian-dictionary/ui/sumerianDictionaryPage'

const kindOptions: readonly (readonly [SumerianWordKind, string])[] = [
  ['all', 'All'],
  ['words', 'Words'],
  ['names', 'Proper nouns'],
]

const sourceOptions: readonly (readonly [SumerianSourceFilter, string])[] = [
  ['any', 'Any source'],
  ['attinger', 'Attinger'],
  ['epsd2', 'ePSD2'],
]

export const exampleQueries = ['lugal', 'dug4', 'king', 'šarru', 'szu']

function RadioGroup<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string
  label: string
  options: readonly (readonly [T, string])[]
  value: T
  onChange: (value: T) => void
}): JSX.Element {
  return (
    <fieldset className="SumerianDictionary__search-options">
      <legend className="visually-hidden">{label}</legend>
      {options.map(([option, optionLabel]) => (
        <Form.Check
          key={option}
          inline
          type="radio"
          id={`sumerian-dictionary-${name}-${option}`}
          name={name}
          label={optionLabel}
          checked={value === option}
          onChange={(): void => onChange(option)}
        />
      ))}
    </fieldset>
  )
}

export default function SumerianDictionarySearchForm({
  state,
}: {
  state: SumerianSearchState
}): JSX.Element {
  const [query, setQuery] = useState(state.query)
  const [kind, setKind] = useState(state.kind)
  const [source, setSource] = useState(state.source)
  const navigate = useNavigate()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    navigate(
      getSumerianSearchUrl({
        query: replaceTransliteration(query.trim(), false, false, true),
        kind,
        source,
      }),
    )
  }

  return (
    <Form
      className="SumerianDictionary__search-form"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <Form.Group controlId="sumerian-dictionary-query">
        <Form.Label className="fw-bold">Search Sumerian lemmas</Form.Label>
        <div className="SumerianDictionary__search-row">
          <Form.Control
            type="search"
            value={query}
            onChange={(event): void => setQuery(event.target.value)}
            placeholder="lugal, dug4, king, šarru…"
          />
          <Button type="submit" variant="primary">
            Search
          </Button>
        </div>
      </Form.Group>
      <div className="SumerianDictionary__search-filters">
        <RadioGroup
          name="kind"
          label="Kind"
          options={kindOptions}
          value={kind}
          onChange={setKind}
        />
        <RadioGroup
          name="source"
          label="Source"
          options={sourceOptions}
          value={source}
          onChange={setSource}
        />
        <span className="SumerianDictionary__examples">
          Try:{' '}
          {exampleQueries.map((example) => (
            <Link
              key={example}
              to={getSumerianSearchUrl({
                query: replaceTransliteration(example, false, false, true),
                kind,
                source,
              })}
            >
              {example}
            </Link>
          ))}
        </span>
      </div>
    </Form>
  )
}
