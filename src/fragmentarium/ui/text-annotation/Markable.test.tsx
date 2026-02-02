import React from 'react'
import { render, screen } from '@testing-library/react'
import Markable from 'fragmentarium/ui/text-annotation/Markable'
import { atfTokenKur } from 'test-support/test-tokens'
import DisplayToken from 'transliteration/ui/DisplayToken'
import userEvent from '@testing-library/user-event'

const word = { ...atfTokenKur, id: 'Word-1' }
const setSelection = jest.fn()
const activeSpanId = null
const setActiveSpanId = jest.fn()

async function renderMarkable(selection: string[] = []): Promise<void> {
  render(
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
})
