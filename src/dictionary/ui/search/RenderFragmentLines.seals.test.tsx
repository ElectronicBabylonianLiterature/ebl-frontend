import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RenderFragmentLines from 'dictionary/ui/search/RenderFragmentLines'
import TransliterationLines, {
  TranslationStyle,
} from 'transliteration/ui/TransliterationLines'
import {
  explicitSealText,
  fullSealText,
  sealFragment,
  sealMarker,
} from 'test-support/sealLocation'
import { createTransliteration } from 'transliteration/application/dtos'
import { previewLine } from 'test-support/fragment-query-preview'
import { Text } from 'transliteration/domain/text'

jest.mock('dictionary/application/WordService')
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

function renderPair(
  preview: Text,
  canonical: Text,
  translationStyle: TranslationStyle = 'inline',
): void {
  render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <section aria-label="Matching preview">
          <RenderFragmentLines
            fragment={sealFragment(preview)}
            linesToShow={5}
          />
        </section>
        <section aria-label="Canonical text">
          <TransliterationLines
            text={canonical}
            translationStyle={translationStyle}
          />
        </section>
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )
}

function assertTargets(expectedIds: readonly string[]): void {
  const links = within(
    screen.getByRole('region', { name: 'Matching preview' }),
  ).getAllByRole('link')
  const targets = within(
    screen.getByRole('region', { name: 'Canonical text' }),
  ).getAllByRole('link')
  const ids = targets.map((target) => target.getAttribute('id'))
  expect(ids).toEqual(expectedIds)
  expect(
    links.map((link) =>
      decodeURIComponent((link.getAttribute('href') ?? '').split('#')[1]),
    ),
  ).toEqual(expectedIds)
  for (const id of expectedIds) {
    expect(ids.filter((value) => value === id)).toHaveLength(1)
    expect(
      targets.find((target) => target.getAttribute('id') === id),
    ).toHaveAttribute('href', `#${encodeURIComponent(id)}`)
  }
}

test.each(['inline', 'standoff'] as const)(
  'explicit seal previews link to actual %s canonical targets',
  (style) => {
    renderPair(explicitSealText(), fullSealText(), style)
    expect(
      screen.getByRole('link', { name: 'tablet o. iii seal 1 1' }),
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'tablet o. iii seal 2 1' }),
    ).toBeVisible()
    assertTargets(['tablet o iii seal 1 1', 'tablet o iii seal 2 1'])
  },
)

test.each(['inline', 'standoff'] as const)(
  'marker-derived seal previews link to actual %s canonical targets',
  (style) => {
    renderPair(fullSealText(), fullSealText(), style)
    assertTargets(['tablet o iii seal 1 1', 'tablet o iii seal 2 1'])
  },
)

test.each(['explicit', 'markers'] as const)(
  'seal-only zero remains a location from %s',
  (source) => {
    const canonical = fullSealText(true, [0])
    renderPair(
      source === 'explicit' ? explicitSealText(true, [0]) : canonical,
      canonical,
    )
    expect(screen.getByRole('link', { name: 'seal 0 1' })).toBeVisible()
    assertTargets(['seal 0 1'])
  },
)

test('explicit metadata overrides marker state', () => {
  const preview = createTransliteration({
    lines: [
      sealMarker(1),
      {
        ...previewLine(1, []),
        location: { object: null, surface: null, column: null, sealNumber: 2 },
      },
    ],
  })
  renderPair(preview, fullSealText(true, [2]))
  assertTargets(['seal 2 1'])
})

test('null metadata falls back to a seal-only marker', () => {
  const text = createTransliteration({
    lines: [sealMarker(0), { ...previewLine(1, []), location: null }],
  })
  renderPair(text, fullSealText(true, [0]))
  assertTargets(['seal 0 1'])
})
