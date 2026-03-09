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
test('Line number with url points to link', () => {
  const externalUrl = 'https://ebl.lmu.de/an-external-link'
  renderLineNumber(externalUrl)
  expect(screen.getByText(lineNumberString)).toHaveAttribute(
    'href',
    `${externalUrl}#${lineNumberString}`,
  )
})
