import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DisplayTextLine from 'transliteration/ui/text-line'
import { getCurrentLabels } from 'transliteration/ui/TransliterationLines'
import {
  defaultLabels,
  labelsAbbreviation,
  Labels,
  sealAbbreviation,
} from 'transliteration/domain/labels'
import { fromTransliterationLineDto } from 'transliteration/application/dtos'
import { previewLine } from 'test-support/fragment-query-preview'
import {
  sealContext,
  sealContextMarkers,
  sealMarker,
} from 'test-support/sealLocation'
import { TextLine } from 'transliteration/domain/text-line'
import { heading } from 'test-support/lines/at'
import { ParallelFragment } from 'transliteration/domain/parallel-line'
import { DisplayParallelFragment } from 'transliteration/ui/parallel-line'

const ordinary = new TextLine(previewLine(60, []))
const cases: readonly [string, Labels | undefined, string][] = [
  ['omitted labels', undefined, '60'],
  ['default labels', defaultLabels, ' 60'],
  ['ordinary context', sealContext, 'tablet o iii 60'],
  [
    'ordinary null seal',
    { ...sealContext, sealNumber: null },
    'tablet o iii 60',
  ],
  [
    'surface statuses',
    {
      ...defaultLabels,
      surface: {
        ...sealContext.surface,
        status: ['PRIME', 'UNCERTAIN', 'CORRECTION', 'COLLATION'],
      },
    },
    "o'?!* 60",
  ],
]

test.each(cases)(
  '%s preserves its exact canonical ID and self-link',
  (_name, labels, id) => {
    render(
      <MemoryRouter>
        <table>
          <tbody>
            <tr>
              <DisplayTextLine line={ordinary} columns={1} labels={labels} />
            </tr>
          </tbody>
        </table>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link')).toHaveAttribute('id', id)
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `#${encodeURIComponent(id)}`,
    )
  },
)

test('default label shape and shared seal spelling preserve absent values and zero', () => {
  expect(defaultLabels).toEqual({ object: null, surface: null, column: null })
  expect(Object.keys(defaultLabels)).toEqual(['object', 'surface', 'column'])
  expect(sealAbbreviation(undefined)).toBe('')
  expect(sealAbbreviation(null)).toBe('')
  expect(sealAbbreviation(0)).toBe('seal 0')
  expect(labelsAbbreviation({ ...sealContext, sealNumber: 2 })).toBe(
    'tablet o iii seal 2',
  )
  expect(labelsAbbreviation(sealContext)).toBe('tablet o iii')
})

test.each([9, 0])(
  'object, surface and column markers clear seal %s',
  (sealNumber) => {
    for (const marker of sealContextMarkers) {
      const labels = getCurrentLabels(
        { ...sealContext, sealNumber },
        fromTransliterationLineDto(marker),
      )
      expect(labels.sealNumber).toBeNull()
    }
  },
)

test('ordinary markers do not add a seal key and seal markers keep the context', () => {
  let labels: Labels = defaultLabels
  for (const marker of sealContextMarkers) {
    labels = getCurrentLabels(labels, fromTransliterationLineDto(marker))
  }
  expect(Object.keys(labels)).toEqual(['object', 'surface', 'column'])
  expect(labels).toEqual(sealContext)
  const zero = getCurrentLabels(
    labels,
    fromTransliterationLineDto(sealMarker(0)),
  )
  expect(zero).toEqual({ ...sealContext, sealNumber: 0 })
  expect(getCurrentLabels(zero, heading)).toBe(zero)
  expect(
    getCurrentLabels(zero, fromTransliterationLineDto(sealMarker(2))),
  ).toEqual({ ...sealContext, sealNumber: 2 })
})

test('parallel reference labels without a seal keep the ordinary wire shape and href', () => {
  const parallel = new ParallelFragment({
    content: [],
    hasCf: false,
    hasDuplicates: false,
    museumNumber: { prefix: 'BM', number: '123', suffix: '' },
    labels: sealContext,
    lineNumber: ordinary.lineNumber,
    exists: true,
  })
  render(
    <MemoryRouter>
      <DisplayParallelFragment fragment={parallel} />
    </MemoryRouter>,
  )
  expect(parallel.labels).toEqual(sealContext)
  expect(Object.keys(parallel.labels)).toEqual(['object', 'surface', 'column'])
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    '/library/BM.123#tablet%20o%20iii%2060',
  )
})
