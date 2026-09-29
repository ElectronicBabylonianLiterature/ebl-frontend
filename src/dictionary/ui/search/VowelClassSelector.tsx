import React from 'react'
import { Form } from 'react-bootstrap'

type VowelClassSelectorProps = {
  selected: string[]
  onChange: (vowelClass: string[]) => void
}

export default function VowelClassSelector({
  selected,
  onChange,
}: VowelClassSelectorProps): JSX.Element {
  const vowels = ['a/a', 'a/i', 'a/u', 'e/e', 'e/u', 'i/i', 'u/u']
  const firstRow = vowels.slice(0, 4)
  const secondRow = vowels.slice(4)

  const handleChange = (vowel: string, checked: boolean) => {
    let vowelClass: string[] = Array.isArray(selected)
      ? [...(selected as string[])]
      : []
    if (checked) {
      vowelClass.push(vowel)
    } else {
      vowelClass = vowelClass.filter((v) => v !== vowel)
    }
    onChange(vowelClass)
  }

  const renderCheckbox = (vowel: string) => (
    <Form.Check
      key={vowel}
      inline
      type="checkbox"
      id={`vowel-${vowel}`}
      label={vowel}
      checked={
        Array.isArray(selected) && (selected as string[]).includes(vowel)
      }
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
