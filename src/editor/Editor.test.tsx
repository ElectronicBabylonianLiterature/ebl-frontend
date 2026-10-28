import React from 'react'
import { render, screen } from '@testing-library/react'
import Editor from 'editor/Editor'

test.each([
  ['text\nmore text', false, null],
  ['', false, null],
  ['value', true, null],
  ['value', false, {}],
  [
    'value',
    false,
    {
      data: {
        errors: [
          {
            type: 'SyntaxError',
            description: 'Invalid line',
            lineNumber: 2,
          },
        ],
      },
    },
  ],
  [
    'value',
    false,
    {
      data: {
        errors: [
          {
            type: 'OtherError',
          },
        ],
      },
    },
  ],
] as [string, boolean, Record<string, unknown>][])(
  'Renders without crashing with props %s %p %p',
  (value, disabled, error) => {
    const onChange = jest.fn()
    const name = 'transliteration'
    render(
      <Editor
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={error}
      />,
    )
    expect(
      screen.getByRole('textbox', {
        name: new RegExp(`^${name.charAt(0).toUpperCase() + name.slice(1)},`),
      }),
    ).toBeInTheDocument()
  },
)

test('names the editor text input', () => {
  render(
    <Editor
      name="transliteration"
      value="value"
      onChange={jest.fn()}
      disabled={false}
      error={null}
    />,
  )

  expect(
    screen.getByRole('textbox', { name: /^Transliteration,/ }),
  ).toBeInTheDocument()
})

test('connects the field label to the actual Ace text input', () => {
  render(
    <>
      <label htmlFor="edition-notes">Notes</label>
      <Editor
        name="notes"
        inputId="edition-notes"
        value="value"
        onChange={jest.fn()}
      />
    </>,
  )

  expect(screen.getByLabelText('Notes')).toHaveAttribute('id', 'edition-notes')
  expect(screen.getByRole('textbox', { name: /^Notes,/ })).toBe(
    screen.getByLabelText('Notes'),
  )
})
