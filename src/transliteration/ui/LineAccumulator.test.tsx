import React from 'react'
import { render } from '@testing-library/react'
import { LineAccumulator } from 'transliteration/ui/LineAccumulator'
import { emptyFirstColumn } from 'test-support/lines/text-columns'
import { kurToken, raToken } from 'test-support/test-tokens'
import {
  CommentaryProtocol,
  Enclosure,
  Token,
} from 'transliteration/domain/token'

const protocol: CommentaryProtocol = {
  enclosureType: [],
  cleanValue: '!qt',
  value: '!qt',
  type: 'CommentaryProtocol',
}

function gloss(side: 'LEFT' | 'RIGHT'): Enclosure {
  return {
    enclosureType: [],
    cleanValue: '',
    value: side === 'LEFT' ? '{(' : ')}',
    side,
    type: 'DocumentOrientedGloss',
  }
}

const brokenAwayEnd: Enclosure = {
  enclosureType: ['BROKEN_AWAY'],
  cleanValue: ']',
  value: ']',
  side: 'RIGHT',
  type: 'BrokenAway',
}

const separator = 'class="Transliteration__wordSeparator '
const glossedSeparator = `<sup class="Transliteration__DocumentOrientedGloss"><span ${separator}`

function markupOf(tokens: readonly Token[]): string {
  const accumulator = new LineAccumulator()
  tokens.forEach((token, index) => accumulator.addColumnToken(token, index))
  return render(<>{accumulator.flatResult}</>).container.innerHTML
}

function occurrences(markup: string, text: string): number {
  return markup.split(text).length - 1
}

test('rejects column tokens, which belong to column creation', () => {
  const [columnToken] = emptyFirstColumn.content

  expect(() => new LineAccumulator().addColumnToken(columnToken, 0)).toThrow(
    'Unexpected column token.',
  )
})

test('marks separators after a commentary protocol', () => {
  expect(markupOf([protocol, raToken, kurToken])).toContain(
    'Transliteration__wordSeparator--commentary-protocol-qt',
  )
})

test('wraps separators inside a gloss', () => {
  const markup = markupOf([
    raToken,
    gloss('LEFT'),
    kurToken,
    raToken,
    brokenAwayEnd,
    gloss('RIGHT'),
    kurToken,
  ])

  expect(occurrences(markup, separator)).toEqual(3)
  expect(occurrences(markup, glossedSeparator)).toEqual(2)
})
