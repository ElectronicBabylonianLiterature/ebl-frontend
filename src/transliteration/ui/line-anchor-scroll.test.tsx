import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LineNumber from 'corpus/ui/LineNumber'
import { TextLine } from 'transliteration/domain/text-line'
import { defaultLabels, Labels } from 'transliteration/domain/labels'
import DisplayTextLine from 'transliteration/ui/text-line'
import { lineDisplayFactory } from 'test-support/chapter-fixtures'
import { lineNumberFactory } from 'test-support/linenumber-factory'
import { textLineDto } from 'test-support/lines/text-line'

let resolveFontsReady: () => void
let viewportTop = 0
let originalFonts: PropertyDescriptor | undefined

beforeEach(() => {
  originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts')
  const fontsReady = new Promise<void>((resolve) => {
    resolveFontsReady = resolve
  })
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: fontsReady },
  })
  jest.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => {
    viewportTop = 0
  })
})

afterEach(() => {
  jest.restoreAllMocks()
  if (originalFonts) {
    Object.defineProperty(document, 'fonts', originalFonts)
  } else {
    delete (document as { fonts?: FontFaceSet }).fonts
  }
})

async function finishFontSwap(displacement: number): Promise<void> {
  viewportTop = displacement
  await act(async () => {
    resolveFontsReady()
    await document.fonts.ready
  })
}

function fragmentLineView({
  number,
  labels,
  encodedHash,
  activeLine = decodeURIComponent(encodedHash),
}: {
  number: number
  labels: Labels
  encodedHash: string
  activeLine?: string
}): JSX.Element {
  const line = new TextLine({
    ...textLineDto,
    lineNumber: lineNumberFactory.build({ number }),
  })
  return (
    <MemoryRouter>
      <table>
        <tbody>
          <tr>
            <DisplayTextLine
              line={line}
              columns={1}
              labels={labels}
              activeLine={activeLine}
            />
          </tr>
        </tbody>
      </table>
    </MemoryRouter>
  )
}

function renderFragmentLine(
  props: Parameters<typeof fragmentLineView>[0],
): ReturnType<typeof render> {
  return render(fragmentLineView(props))
}

test.each([
  {
    name: 'leading-space fragment line',
    number: 60,
    labels: defaultLabels,
    encodedHash: '%2060',
    displacement: -430,
    expectedId: ' 60',
  },
  {
    name: 'obverse fragment line',
    number: 43,
    labels: {
      ...defaultLabels,
      surface: { abbreviation: 'o', status: [], surface: 'OBVERSE', text: '' },
    },
    encodedHash: 'o%2043',
    displacement: -324,
    expectedId: 'o 43',
  },
])(
  'keeps the $name at the viewport after fonts settle',
  async ({ number, labels, encodedHash, displacement, expectedId }) => {
    renderFragmentLine({ number, labels, encodedHash })

    expect(screen.getByRole('link')).toHaveAttribute('id', expectedId)
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
    await finishFontSwap(displacement)

    expect(viewportTop).toBe(0)
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(2)
  },
)

test('keeps corpus line 52 at the viewport after fonts settle', async () => {
  const line = lineDisplayFactory.build({
    number: lineNumberFactory.build({ number: 52 }),
  })
  render(
    <table>
      <tbody>
        <tr>
          <LineNumber
            line={line}
            activeLine={decodeURIComponent('52')}
            showOldLineNumbers={false}
          />
        </tr>
      </tbody>
    </table>,
  )

  expect(screen.getByRole('link')).toHaveAttribute('id', '52')
  expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
  await finishFontSwap(-360)

  expect(viewportTop).toBe(0)
  expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(2)
})

test('cancels a stale font correction when the active line changes', async () => {
  const props = {
    number: 60,
    labels: defaultLabels,
    encodedHash: '%2060',
  }
  const { rerender } = renderFragmentLine(props)

  expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
  rerender(fragmentLineView({ ...props, activeLine: '' }))
  await finishFontSwap(-430)

  expect(viewportTop).toBe(-430)
  expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
})
