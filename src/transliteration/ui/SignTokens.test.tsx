import React from 'react'
import { render } from '@testing-library/react'
import { EnclosureType, Token } from 'transliteration/domain/token'
import DisplayToken from 'transliteration/ui/DisplayToken'

const createToken = (
  type: string,
  properties: Record<string, string | readonly string[]> = {},
  enclosureType: readonly EnclosureType[] = [],
): Token =>
  ({
    type,
    value: '',
    cleanValue: '',
    enclosureType,
    flags: [],
    modifiers: [],
    ...properties,
  }) as Token

function renderText(token: Token): string | null {
  return render(<DisplayToken token={token} />).container.textContent
}

test.each([
  [createToken('UnclearSign'), 'x'],
  [createToken('UnclearSign', {}, ['BROKEN_AWAY']), 'o'],
  [createToken('UnidentifiedSign'), 'X'],
  [createToken('EgyptianMetricalFeetSeparator'), '•'],
  [createToken('Divider', { divider: ':' }), ':'],
  [createToken('GreekLetter', { letter: 'α' }), 'α'],
  [createToken('LineBreak'), '|'],
  [createToken('Tabulation'), ''],
])('renders %o as %s', (token, expected) => {
  expect(renderText(token)).toEqual(expected)
})

test('wraps damaged signs in half brackets', () => {
  expect(renderText(createToken('UnidentifiedSign', { flags: ['#'] }))).toEqual(
    '⸢X⸣',
  )
})
