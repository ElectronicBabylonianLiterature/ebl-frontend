import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import React, { useRef } from 'react'
import useScrollToActiveLine from 'transliteration/ui/useScrollToActiveLine'
import { act, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TransliterationLines from 'transliteration/ui/TransliterationLines'
import {
  atLineLabelKeys,
  fullSealText,
  sealContext,
  sealContextMarkers,
  sealMarker,
} from 'test-support/sealLocation'
import { previewLine, readingWord } from 'test-support/fragment-query-preview'
import { createTransliteration } from 'transliteration/application/dtos'

jest.mock('dictionary/application/WordService')
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

const ids = ['tablet o iii seal 1 1', 'tablet o iii seal 2 1']
const legacy = 'tablet o iii 1'
const text = fullSealText()
let calls: string[] = []
let completeFonts: () => void
let originalFonts: PropertyDescriptor | undefined
let scroll: jest.SpyInstance

function lines(activeLine: string, displayed = text): JSX.Element {
  return (
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <TransliterationLines text={displayed} activeLine={activeLine} />
      </DictionaryContext.Provider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  calls = []
  originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts')
  const ready = new Promise<void>((resolve) => {
    completeFonts = resolve
  })
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { status: 'loading', ready },
  })
  scroll = jest
    .spyOn(HTMLElement.prototype, 'scrollIntoView')
    .mockImplementation(function (this: HTMLElement) {
      calls.push(this.id)
    })
})

afterEach(() => {
  scroll.mockRestore()
  if (originalFonts) Object.defineProperty(document, 'fonts', originalFonts)
  else Reflect.deleteProperty(document, 'fonts')
})

test.each(ids)(
  'new canonical hash %s scrolls only its real target, including font correction',
  async (id) => {
    render(lines(id))
    expect(calls).toEqual([id])
    await act(async () => {
      completeFonts()
      await Promise.resolve()
    })
    expect(calls).toEqual([id, id])
  },
)

test('legacy ambiguous router hash preserves both matching refs in order', async () => {
  render(lines(legacy))
  expect(calls).toEqual(ids)
  await act(async () => {
    completeFonts()
    await Promise.resolve()
  })
  expect(calls).toEqual([...ids, ...ids])
})

const [objectMarker, surfaceMarker, columnMarker] = sealContextMarkers
const ordinaryLine = previewLine(1, [readingWord])

test.each([
  [
    'main-text line before the seal',
    [
      objectMarker,
      surfaceMarker,
      columnMarker,
      ordinaryLine,
      sealMarker(1),
      ordinaryLine,
    ],
  ],
  [
    'main-text line after the seal',
    [
      objectMarker,
      surfaceMarker,
      columnMarker,
      sealMarker(1),
      ordinaryLine,
      columnMarker,
      ordinaryLine,
    ],
  ],
])('old hash scrolls only the real line with a %s', (_name, atfLines) => {
  render(lines(legacy, createTransliteration({ lines: atfLines })))
  expect(calls).toEqual([legacy])
})

test('lines after a later surface marker lose the seal label', () => {
  const reverse = {
    ...surfaceMarker,
    [atLineLabelKeys.surface]: {
      ...sealContext.surface,
      surface: 'REVERSE',
      abbreviation: 'r',
    },
  }
  render(
    lines(
      'r 1',
      createTransliteration({
        lines: [sealMarker(1), ordinaryLine, reverse, ordinaryLine],
      }),
    ),
  )
  expect(calls).toEqual(['r 1'])
})

test('changing active hash cancels pending corrections and missing hash does nothing', async () => {
  const { rerender } = render(lines(ids[0]))
  rerender(lines(ids[1]))
  rerender(lines('missing'))
  await act(async () => {
    completeFonts()
    await Promise.resolve()
  })
  expect(calls).toEqual(ids)
})

test('unmount cancels both pending legacy corrections', async () => {
  const { unmount } = render(lines(legacy))
  unmount()
  await act(async () => {
    completeFonts()
    await Promise.resolve()
  })
  expect(calls).toEqual(ids)
})

function OrdinaryLine({
  activeLine,
  alias,
}: {
  activeLine: string
  alias?: string
}): JSX.Element {
  const reference = useRef<HTMLAnchorElement>(null)
  useScrollToActiveLine(reference, 'ordinary', activeLine, alias)
  return (
    <a id="ordinary" href="#ordinary" ref={reference}>
      Ordinary line
    </a>
  )
}

test('ordinary three-argument behavior and optional alias dependency remain scoped', () => {
  const { rerender } = render(<OrdinaryLine activeLine="" />)
  expect(calls).toEqual([])
  rerender(<OrdinaryLine activeLine="ordinary" />)
  expect(calls).toEqual(['ordinary'])
  rerender(<OrdinaryLine activeLine="old" alias="different" />)
  expect(calls).toEqual(['ordinary'])
  rerender(<OrdinaryLine activeLine="old" alias="old" />)
  expect(calls).toEqual(['ordinary', 'ordinary'])
})
