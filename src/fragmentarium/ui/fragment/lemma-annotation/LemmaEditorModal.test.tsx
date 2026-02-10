import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import LemmaEditorModal from './LemmaEditorModal'
import WordService from 'dictionary/application/WordService'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { kurToken } from 'test-support/test-tokens'
import { wordFactory } from 'test-support/word-fixtures'

jest.mock('dictionary/application/WordService')
jest.mock('./ProperNounCreationPanel', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="proper-noun-panel">
      <button onClick={onClose} data-testid="close-panel">
        Close Panel
      </button>
    </div>
  ),
}))

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()
let token: EditableToken
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
  onCreateProperNoun: jest.fn(),
}
let confirmSuggestionSpy: jest.SpyInstance
interface OverrideProps {
  process?: 'loadingLemmas' | null | 'saving'
  isDirty?: boolean
  token?: EditableToken | null
}

const renderLemmaEditorModal = (props?: OverrideProps) => {
  render(
    <LemmaEditorModal
      token={props?.token !== undefined ? props.token : token}
      title="Lemma Editor"
      process={props?.process || null}
      isDirty={props?.isDirty || false}
      wordService={wordServiceMock}
      {...mockCallbacks}
    />
  )
}

describe('LemmaEditorModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    wordServiceMock.searchLemma.mockResolvedValue([mockWord])
    token = new EditableToken(kurToken, 0, 0, 0, [])
    confirmSuggestionSpy = jest.spyOn(token, 'confirmSuggestion')
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
    await act(async () => {
      fireEvent.change(input, { target: { value: 'mock' } })
    })
    const suggestion = await screen.findByText('mockLemma')
    fireEvent.click(suggestion)
    expect(mockCallbacks.handleChange).toHaveBeenCalled()
  })
  it('calls submit callbacks', async () => {
    renderLemmaEditorModal({ isDirty: true })
    const input = screen.getByLabelText('edit-token-lemmas')
    await act(async () => {
      fireEvent.submit(input)
    })
    expect(mockCallbacks.selectNextToken).toHaveBeenCalled()
    expect(confirmSuggestionSpy).toHaveBeenCalled()
  })

  it('displays spinner in autofill button when loading lemmas', () => {
    renderLemmaEditorModal({ process: 'loadingLemmas' })
    const autofillButton = screen.getByLabelText('autofill-lemmas')
    expect(autofillButton).toContainHTML('spinner')
  })

  it('displays spinner in save button when saving', () => {
    renderLemmaEditorModal({ process: 'saving' })
    const saveButton = screen.getByLabelText('save-updates')
    expect(saveButton).toContainHTML('spinner')
  })

  it('disables autofill button when dirty', () => {
    renderLemmaEditorModal({ isDirty: true })
    expect(screen.getByLabelText('autofill-lemmas')).toBeDisabled()
  })

  it('disables save button when processing', () => {
    renderLemmaEditorModal({ process: 'saving' })
    expect(screen.getByLabelText('save-updates')).toBeDisabled()
  })

  describe('Proper Noun Panel', () => {
    it('does not display proper noun panel by default', () => {
      renderLemmaEditorModal()
      expect(screen.queryByTestId('proper-noun-panel')).not.toBeInTheDocument()
    })
  })
})
