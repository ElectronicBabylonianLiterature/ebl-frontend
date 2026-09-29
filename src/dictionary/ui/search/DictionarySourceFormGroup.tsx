import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import { HelpEntry } from 'dictionary/ui/search/WordSearchHelp'

type DictionarySourceSelectorProps = {
  selected: string[]
  onChange: (origin: string[]) => void
}

function DictionarySourceSelector({
  selected,
  onChange,
}: DictionarySourceSelectorProps): JSX.Element {
  const sources = [
    { value: 'CDA', label: 'Concise Dictionary of Akkadian' },
    { value: 'AFO_REGISTER', label: 'AfO Register' },
    { value: 'SAD', label: 'Supplements to the Akkadian Dictionaries' },
  ]

  const normalizedSelected = Array.isArray(selected) ? selected : []
  const isAllSelected = normalizedSelected.length === 0

  const handleAllChange = (checked: boolean) => {
    if (checked) {
      onChange([])
    } else {
      onChange(['CDA'])
    }
  }

  const handleSourceChange = (source: string, checked: boolean) => {
    if (isAllSelected && checked) {
      onChange([source])
      return
    }

    let originList: string[] = [...normalizedSelected]
    if (checked) {
      originList.push(source)
    } else {
      originList = originList.filter((s) => s !== source)
    }
    onChange(originList)
  }

  const renderSwitch = (source: { value: string; label: string }) => (
    <Form.Check
      key={source.value}
      type="switch"
      inline
      id={`origin-${source.value}`}
      label={source.label}
      checked={!isAllSelected && normalizedSelected.includes(source.value)}
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

type DictionarySourceFormGroupProps = {
  origin: string[]
  onChange: (origin: string[]) => void
}

export default function DictionarySourceFormGroup({
  origin,
  onChange,
}: DictionarySourceFormGroupProps): JSX.Element {
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
        <DictionarySourceSelector selected={origin} onChange={onChange} />
      </Col>
    </Form.Group>
  )
}
