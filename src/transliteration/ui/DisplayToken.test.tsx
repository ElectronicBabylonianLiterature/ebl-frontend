import React from 'react'
import { render, screen } from '@testing-library/react'
import { NamedSign, Token } from 'transliteration/domain/token'
import DisplayToken from 'transliteration/ui/DisplayToken'
import {
  brokenAway,
  namedSignFixture,
  valueToken,
} from 'test-support/named-sign-fixtures'
import { raToken } from 'test-support/test-tokens'

const reading = (value: string, subIndex = 1): NamedSign =>
  namedSignFixture({ nameParts: [valueToken(value)], subIndex })

const createToken = (type: string, properties: Partial<Token>): Token =>
  ({
    type,
    value: '',
    cleanValue: '',
    enclosureType: [],
    ...properties,
  }) as Token

function renderText(token: Token): string | null {
  return render(<DisplayToken token={token} />).container.textContent
}

test.each([
  [createToken('UnknownNumberOfSigns', {}), '…'],
  [createToken('WordOmitted', {}), 'ø'],
  [createToken('LanguageShift', { value: '%sux' }), '%sux'],
  [createToken('BrokenAway', { value: '[' }), '['],
  [createToken('Joiner', { parts: [reading('a'), reading('b')] }), 'ab'],
  [
    createToken('Variant', {
      tokens: [reading('a'), reading('b')],
    } as Partial<Token>),
    'a/b',
  ],
  [
    createToken('Word', {
      parts: [reading('ku'), reading('ra')],
    } as Partial<Token>),
    'kura',
  ],
])('renders %o as %s', (token, expected) => {
  expect(renderText(token)).toEqual(expected)
})

test('renders glosses with enclosures', () => {
  const gloss = createToken('Determinative', {
    parts: [brokenAway('[', 'LEFT'), reading('d')],
  })

  expect(renderText(gloss)).toEqual('.[d')
})

test('renders named signs with sub index, sign and surrogate', () => {
  const namedSign: NamedSign = {
    ...namedSignFixture({
      nameParts: [valueToken('ku'), brokenAway('[', 'LEFT'), valueToken('r')],
      subIndex: 5,
    }),
    flags: ['#'],
    sign: reading('KUR'),
    surrogate: [reading('ra')],
  }

  expect(renderText(namedSign)).toEqual('⸢ku[r₅(KUR)<(ra)>⸣')
})

test('renders named signs without empty surrogates', () => {
  expect(renderText({ ...reading('ra'), surrogate: [] })).toEqual('ra')
})

test('renders Akkadian words', () => {
  render(<DisplayToken token={raToken} />)

  expect(screen.getByText('ra')).toBeInTheDocument()
})
