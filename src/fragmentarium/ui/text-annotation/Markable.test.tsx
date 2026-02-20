import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import Markable from 'fragmentarium/ui/text-annotation/Markable'
import { atfTokenKur } from 'test-support/test-tokens'
import DisplayToken from 'transliteration/ui/DisplayToken'
import userEvent from '@testing-library/user-event'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'

const word = { ...atfTokenKur, id: 'Word-1' }
const word2 = { ...atfTokenKur, id: 'Word-2' }
const setSelection = jest.fn()
const activeSpanId = null
const setActiveSpanId = jest.fn()
const dispatch = jest.fn()

function renderWithContext(
  ui: React.ReactElement,
  words: string[] = ['Word-1'],
): void {
  render(
    <AnnotationContext.Provider value={[{ entities: [], words }, dispatch]}>
      {ui}
    </AnnotationContext.Provider>,
  )
}

async function renderMarkable(selection: string[] = []): Promise<void> {
  renderWithContext(
    <Markable
      token={word}
      selection={selection}
      setSelection={setSelection}
      activeSpanId={activeSpanId}
      setActiveSpanId={setActiveSpanId}
    >
      <DisplayToken token={word} />
    </Markable>,
  )
}

describe('Markable', () => {
  it('renders the token', async () => {
    await renderMarkable()
    expect(screen.getByText('kur')).toBeInTheDocument()
  })
  it('calls setSelection', async () => {
    await renderMarkable()
    await userEvent.click(screen.getByText('kur'))

    expect(setSelection).toHaveBeenCalled()
  })
  it('does not highlight unselected markables', async () => {
    await renderMarkable()
    expect(screen.getByRole('button')).not.toHaveClass('selected')
  })
  it('highlights the selected markable', async () => {
    await renderMarkable(['Word-1'])
    expect(screen.getByRole('button')).toHaveClass('selected')
  })
  it('selects across tokens when selection starts on separator', async () => {
    const setSelectionLocal = jest.fn()
    const setActiveSpanIdLocal = jest.fn()

    renderWithContext(
      <div>
        <Markable
          token={word}
          selection={[]}
          setSelection={setSelectionLocal}
          activeSpanId={activeSpanId}
          setActiveSpanId={setActiveSpanIdLocal}
        >
          <DisplayToken token={word} />
        </Markable>
        <span data-testid="separator" />
        <Markable
          token={word2}
          selection={[]}
          setSelection={setSelectionLocal}
          activeSpanId={activeSpanId}
          setActiveSpanId={setActiveSpanIdLocal}
        >
          <DisplayToken token={word2} />
        </Markable>
      </div>,
      ['Word-1', 'Word-2'],
    )

    const separator = screen.getByTestId('separator')
    const [, secondMarkable] = screen.getAllByRole('button')
    const selection = {
      anchorNode: separator,
      focusNode: secondMarkable,
      addRange: jest.fn(),
      empty: jest.fn(),
      removeAllRanges: jest.fn(),
    } as unknown as Selection

    const documentSelection = jest
      .spyOn(document, 'getSelection')
      .mockReturnValue(selection)
    const windowSelection = jest
      .spyOn(window, 'getSelection')
      .mockReturnValue(selection)

    fireEvent.mouseUp(screen.getAllByText('kur')[1])

    expect(setSelectionLocal).toHaveBeenCalledWith(['Word-1', 'Word-2'])

    documentSelection.mockRestore()
    windowSelection.mockRestore()
  })
})
