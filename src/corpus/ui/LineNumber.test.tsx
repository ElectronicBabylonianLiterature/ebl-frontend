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
          { associations: { number: LINE_NUMBER } }
        ),
      ],
    },
  }
)
const lineNumberString = lineNumberToString(lineDisplay.number)

function renderLineNumber(): void {
  render(
    <table>
      <tbody>
        <tr>
          <LineNumber
            line={lineDisplay}
            activeLine={''}
            showOldLineNumbers={true}
          />
        </tr>
      </tbody>
    </table>
  )
}

test('LineNumber', () => {
  renderLineNumber()
  expect(screen.getByText(lineNumberString)).toBeVisible()
  expect(screen.getByText(LINE_NUMBER)).toBeVisible()
})
test('Clicking on line number sets anchor', () => {
  renderLineNumber()
  userEvent.click(screen.getByText(lineNumberString))
  expect(global.window.location.hash).toEqual(`#${lineNumberString}`)
})
