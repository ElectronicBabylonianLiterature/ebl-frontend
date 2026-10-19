import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import { HelpEntry } from 'dictionary/ui/search/WordSearchHelp'

type DictionarySourceProps = {
  selected: string[]
  onChange: (origin: string[]) => void
}

const sources = [
  { value: 'CDA', label: 'Concise Dictionary of Akkadian' },
  { value: 'AFO_REGISTER', label: 'AfO Register' },
  { value: 'SAD', label: 'Supplements to the Akkadian Dictionaries' },
]

function DictionarySourceSelector({
  selected,
  onChange,
}: DictionarySourceProps): JSX.Element {
  const isAllSelected = selected.length === 0

  const handleAllChange = (checked: boolean): void => {
    onChange(checked ? [] : ['CDA'])
  }

  const handleSourceChange = (source: string, checked: boolean): void => {
    if (isAllSelected && checked) {
      onChange([source])
    } else {
      onChange(
        checked
          ? [...selected, source]
          : selected.filter((selectedSource) => selectedSource !== source),
      )
    }
  }

  const renderSwitch = (source: {
    value: string
    label: string
  }): JSX.Element => (
    <Form.Check
      key={source.value}
      type="switch"
      inline
      id={`origin-${source.value}`}
      label={source.label}
      checked={!isAllSelected && selected.includes(source.value)}
      onChange={(event) => {
        handleSourceChange(source.value, event.target.checked)
      }}
    />
  )

  return (
    <div>
      <Form.Check
        type="switch"
        id="origin-all"
        label="All sources"
        checked={isAllSelected}
        onChange={(event) => {
          handleAllChange(event.target.checked)
        }}
        style={{ fontWeight: 'bold', marginRight: '1rem' }}
      />
      {sources.map(renderSwitch)}
    </div>
  )
}

export default function DictionarySourceFormGroup({
  selected,
  onChange,
}: DictionarySourceProps): JSX.Element {
  return (
    <Form.Group as={Row} controlId="origin">
      <Form.Label column sm={3}>
        Dictionary source
      </Form.Label>
      <Col sm={1}>
        {HelpEntry(
          'Select one or more dictionary sources. Select "All sources" to search across all dictionaries.',
        )}
      </Col>
      <Col sm={8}>
        <DictionarySourceSelector selected={selected} onChange={onChange} />
      </Col>
    </Form.Group>
  )
}
