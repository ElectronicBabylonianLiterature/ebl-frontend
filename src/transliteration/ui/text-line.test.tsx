import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DisplayTextLine from 'transliteration/ui/text-line'
import textLine from 'test-support/lines/text-line'
import { lineNumberToAtf } from 'transliteration/domain/lineNumberToString'

const lineId = lineNumberToAtf(textLine.lineNumber)

function renderLine(activeLine: string): void {
  render(
    <MemoryRouter>
      <table>
        <tbody>
          <tr>
            <DisplayTextLine
              line={textLine}
              columns={1}
              activeLine={activeLine}
            />
          </tr>
        </tbody>
      </table>
    </MemoryRouter>,
  )
}

describe('DisplayTextLine', () => {
  beforeEach(() => jest.clearAllMocks())

  it('scrolls the active line into view', () => {
    renderLine(lineId)

    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
  })

  it('does not scroll a line that is not active into view', () => {
    renderLine('42.')

    expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()
    expect(screen.getByRole('link')).toHaveAttribute('id', lineId)
  })

  it('scrolls no line into view when none is active', () => {
    render(
      <MemoryRouter>
        <table>
          <tbody>
            <tr>
              <DisplayTextLine line={textLine} columns={1} />
            </tr>
          </tbody>
        </table>
      </MemoryRouter>,
    )

    expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()
  })
})
