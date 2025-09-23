import React from 'react'
import { render } from '@testing-library/react'
import Editor from './Editor'

test.each([
  ['text\nmore text', false, null, false],
  ['', false, null, false],
  ['value', true, null, false],
  ['value', false, {}, false],
  ['value', false, null, true],
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
    false,
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
    true,
  ],
] as [string, boolean, Record<string, unknown>, boolean][])(
  'Renders without crashing with props %s %p %p %p',
  (value, disabled, error, enableSpellCheck) => {
    const onChange = jest.fn()
    const name = 'transliteration'
    render(
      <Editor
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={error}
        enableSpellCheck={enableSpellCheck}
      />
    )
  }
)
