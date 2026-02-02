import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LemmaEditorModal from './LemmaEditorModal'
import WordService from 'dictionary/application/WordService'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { kurToken } from 'test-support/test-tokens'
import { wordFactory } from 'test-support/word-fixtures'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()
const token = new EditableToken(kurToken, 0, 0, 0, [])
const mockWord = wordFactory.build({
  _id: 'mockLemma',
  lemma: ['mockLemma'],
  homonym: 'I',
})
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
const confirmSuggestionSpy = jest.spyOn(token, 'confirmSuggestion')
interface OverrideProps {
  process?: 'loadingLemmas' | null
  isDirty?: boolean
}

const renderLemmaEditorModal = (props?: OverrideProps) => {
  render(
    <LemmaEditorModal
      token={token}
      title="Lemma Editor"
      process={props?.process || null}
      isDirty={props?.isDirty || false}
      wordService={wordServiceMock}
      {...mockCallbacks}
    />,
  )
}

describe('LemmaEditorModal', () => {
  beforeEach(() => {
    wordServiceMock.searchLemma.mockResolvedValue([mockWord])
  })
  it('renders modal with title', () => {
    renderLemmaEditorModal()
    expect(screen.getByText('Lemma Editor')).toBeInTheDocument()
  })

  it('disables save button when not dirty', () => {
    renderLemmaEditorModal()
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled()
  })

  it('disables autofill button when processing', () => {
    renderLemmaEditorModal({ process: 'loadingLemmas' })
    expect(screen.getByLabelText('autofill-lemmas')).toBeDisabled()
  })

  it('calls saveUpdates on save button click', () => {
    renderLemmaEditorModal({ isDirty: true })
    fireEvent.click(screen.getByLabelText('save-updates'))
    expect(mockCallbacks.saveUpdates).toHaveBeenCalled()
  })

  it('calls handleChange on changing input', async () => {
    renderLemmaEditorModal({ isDirty: true })
    const input = screen.getByLabelText('edit-token-lemmas')
    fireEvent.change(input, { target: { value: 'mock' } })
    const suggestion = await screen.findByText('mockLemma')
    fireEvent.click(suggestion)
    expect(mockCallbacks.handleChange).toHaveBeenCalled()
  })
  it('calls submit callbacks', async () => {
    renderLemmaEditorModal({ isDirty: true })
    const input = screen.getByLabelText('edit-token-lemmas')
    fireEvent.submit(input)
    expect(mockCallbacks.selectNextToken).toHaveBeenCalled()
    expect(confirmSuggestionSpy).toHaveBeenCalled()
  })
})
