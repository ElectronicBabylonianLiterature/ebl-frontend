import React from 'react'
import { render } from '@testing-library/react'
import Editor from './Editor'

test.each([
  ['text\nmore text', false, null],
  ['', false, null],
  ['value', true, null],
  ['value', false, {}],
  [
    'value',
    false,
    {
      errors: [
        {
          type: 'SyntaxError',
          description: 'Invalid line',
          lineNumber: 2,
        },
      ],
    },
  ],
  [
    'value',
    false,
    {
      errors: [
        {
          type: 'OtherError',
        },
      ],
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
  },
)
