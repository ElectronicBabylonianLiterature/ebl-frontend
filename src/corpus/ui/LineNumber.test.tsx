import React from 'react'
import { render, screen } from '@testing-library/react'
import { lineDisplayFactory } from 'test-support/chapter-fixtures'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import LineNumber from './LineNumber'
import { oldLineNumberFactory } from 'test-support/linenumber-factory'
import userEvent from '@testing-library/user-event'

window.HTMLElement.prototype.scrollIntoView = jest.fn()

const LINE_NUMBER = '76a'

const lineDisplay = lineDisplayFactory.build(
  {},
  {
    associations: {
      oldLineNumbers: [
        oldLineNumberFactory.build(
          {},
          { associations: { number: LINE_NUMBER } },
        ),
      ],
    },
  },
)
const lineNumberString = lineNumberToString(lineDisplay.number)

beforeEach(() => {
  ;(
    window.HTMLElement.prototype.scrollIntoView as jest.MockedFunction<
      HTMLElement['scrollIntoView']
    >
  ).mockClear()
})

function renderLineNumber(url = ''): void {
  render(
    <table>
      <tbody>
        <tr>
          <LineNumber
            line={lineDisplay}
            activeLine={''}
            showOldLineNumbers={true}
            url={url}
          />
        </tr>
      </tbody>
    </table>,
  )
}

test('LineNumber', () => {
  renderLineNumber()
  expect(screen.getByText(lineNumberString)).toBeVisible()
  expect(screen.getByText(LINE_NUMBER)).toBeVisible()
})
test('Clicking on line number sets anchor', async () => {
  renderLineNumber()
  await userEvent.click(screen.getByText(lineNumberString))
  expect(global.window.location.hash).toEqual(`#${lineNumberString}`)
})
test('Clicking on line number scrolls to line', async () => {
  renderLineNumber()
  await userEvent.click(screen.getByText(lineNumberString))
  expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
})

test('Clicking on line number uses non-animated scrolling when reduced motion is enabled', async () => {
  const originalMatchMedia = window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }) as MediaQueryList,
  })

  renderLineNumber()
  await userEvent.click(screen.getByText(lineNumberString))

  expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
    behavior: 'auto',
  })

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: originalMatchMedia,
  })
})

test('Line number with url points to link', () => {
  const externalUrl = 'https://ebl.lmu.de/an-external-link'
  renderLineNumber(externalUrl)
  expect(screen.getByText(lineNumberString)).toHaveAttribute(
    'href',
    `${externalUrl}#${lineNumberString}`,
  )
})
