import React from 'react'
import { Form } from 'react-bootstrap'

type VowelClassSelectorProps = {
  selected: string[]
  onChange: (vowelClass: string[]) => void
}

const vowels = ['a/a', 'a/i', 'a/u', 'e/e', 'e/u', 'i/i', 'u/u']

export default function VowelClassSelector({
  selected,
  onChange,
}: VowelClassSelectorProps): JSX.Element {
  const firstRow = vowels.slice(0, 4)
  const secondRow = vowels.slice(4)

  const handleChange = (vowel: string, checked: boolean): void => {
    onChange(
      checked
        ? [...selected, vowel]
        : selected.filter((selectedVowel) => selectedVowel !== vowel),
    )
  }

  const renderCheckbox = (vowel: string): JSX.Element => (
    <Form.Check
      key={vowel}
      inline
      type="checkbox"
      id={`vowel-${vowel}`}
      label={vowel}
      checked={selected.includes(vowel)}
      onChange={(event) => {
        handleChange(vowel, event.target.checked)
      }}
    />
  )

  return (
    <div>
      <div style={{ marginBottom: '0.5rem' }}>
        {firstRow.map(renderCheckbox)}
      </div>
      <div>{secondRow.map(renderCheckbox)}</div>
    </div>
  )
}
