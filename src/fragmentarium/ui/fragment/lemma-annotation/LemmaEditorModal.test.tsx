import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LemmaEditorModal from './LemmaEditorModal'
import WordService from 'dictionary/application/WordService'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { kurToken } from 'test-support/test-tokens'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()
const token = new EditableToken(kurToken, 0, 0, 0, [])
const mockCallbacks = {
  handleChange: jest.fn(),
  selectNextToken: jest.fn(),
  selectPreviousToken: jest.fn(),
  autofillLemmas: jest.fn(),
  saveUpdates: jest.fn(),
  onResetCurrent: jest.fn(),
  onMouseEnter: jest.fn(),
  onMouseLeave: jest.fn(),
  onMultiApply: jest.fn(),
  onMultiReset: jest.fn(),
}

describe('LemmaEditorModal', () => {
  it('renders modal with title', () => {
    render(
      <LemmaEditorModal
        token={token}
        title="Lemma Editor"
        process={null}
        isDirty={false}
        wordService={wordServiceMock}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText('Lemma Editor')).toBeInTheDocument()
  })

  it('disables save button when not dirty', () => {
    render(
      <LemmaEditorModal
        token={token}
        title="Lemma Editor"
        process={null}
        isDirty={false}
        wordService={wordServiceMock}
        {...mockCallbacks}
      />
    )
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled()
  })

  it('disables autofill button when processing', () => {
    render(
      <LemmaEditorModal
        token={token}
        title="Lemma Editor"
        process={'loadingLemmas'}
        isDirty={false}
        wordService={wordServiceMock}
        {...mockCallbacks}
      />
    )
    expect(screen.getByLabelText('autofill-lemmas')).toBeDisabled()
  })

  it('calls saveUpdates on save button click', () => {
    render(
      <LemmaEditorModal
        token={token}
        title="Lemma Editor"
        process={null}
        isDirty={true}
        wordService={wordServiceMock}
        {...mockCallbacks}
      />
    )
    fireEvent.click(screen.getByLabelText('save-updates'))
    expect(mockCallbacks.saveUpdates).toHaveBeenCalled()
  })
})
