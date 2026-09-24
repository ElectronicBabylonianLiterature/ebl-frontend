import React from 'react'
import { render, screen } from '@testing-library/react'
import Editor, { createAnnotations } from 'editor/Editor'

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
    expect(screen.getByRole('textbox', { name })).toBeInTheDocument()
  },
)

test('creates an annotation on the reported line', () => {
  expect(
    createAnnotations({
      data: {
        errors: [{ description: 'Invalid line', lineNumber: 2 }],
      },
    }),
  ).toEqual([
    {
      row: 1,
      column: 0,
      type: 'error',
      text: 'Invalid line',
    },
  ])
})

test.each([null, 'invalid', { transliteration: ['Invalid transliteration'] }])(
  'ignores non-array error data %p',
  (errors) => {
    expect(createAnnotations({ data: { errors } })).toEqual([])
  },
)

test.each([
  ['missing line', { description: 'Invalid transliteration' }],
  ['non-string description', { description: 7, lineNumber: 2 }],
  ['infinite line', { description: 'Invalid line', lineNumber: Infinity }],
  ['fractional line', { description: 'Invalid line', lineNumber: 1.5 }],
  ['zero line', { description: 'Invalid line', lineNumber: 0 }],
  ['negative line', { description: 'Invalid line', lineNumber: -1 }],
  ['string line', { description: 'Invalid line', lineNumber: '2' }],
])('ignores production-shaped errors with %s', (_label, error) => {
  expect(createAnnotations({ data: { errors: [error] } })).toEqual([])
})

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
    screen.getByRole('textbox', { name: 'transliteration' }),
  ).toBeInTheDocument()
})
