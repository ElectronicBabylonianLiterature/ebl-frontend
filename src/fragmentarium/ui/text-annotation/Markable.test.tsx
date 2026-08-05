import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Markable from 'fragmentarium/ui/text-annotation/Markable'
import {
  renderWithAnnotationContext,
  word,
} from 'fragmentarium/ui/text-annotation/markable.testSupport'
import DisplayToken from 'transliteration/ui/DisplayToken'

jest.mock('realia/application/RealiaService')

const setSelection = jest.fn()
const setActiveSpanId = jest.fn()

async function renderMarkable(selection: string[] = []): Promise<void> {
  renderWithAnnotationContext(
    <Markable
      token={word}
      selection={selection}
      setSelection={setSelection}
      activeSpanId={null}
      setActiveSpanId={setActiveSpanId}
    >
      <DisplayToken token={word} />
    </Markable>,
  )
  await screen.findByText('kur')
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Markable', () => {
  it('renders the token', async () => {
    await renderMarkable()
    expect(screen.getByText('kur')).toBeInTheDocument()
  })

  it('calls setSelection', async () => {
    await renderMarkable()
    await userEvent.click(screen.getByText('kur'))

    await waitFor(() => {
      expect(setSelection).toHaveBeenCalled()
    })
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
