import { screen, fireEvent, waitFor } from '@testing-library/react'
import { wordFactory } from 'test-support/word-fixtures'
import Word from 'dictionary/domain/Word'
import {
  createProperNounPanelTestContext,
  fillProperNounForm,
  resetProperNounPanelMocks,
} from 'fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.testSupport'

jest.mock('dictionary/application/WordService')

const { wordServiceMock, onCloseMock, renderPanel } =
  createProperNounPanelTestContext()

beforeEach(() => {
  resetProperNounPanelMocks(wordServiceMock)
})

describe('Button States & Callbacks', () => {
  it('renders cancel and create buttons', () => {
    renderPanel()
    expect(
      screen.getByLabelText('cancel-properNoun-creation'),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('save-properNoun-creation'),
    ).toBeInTheDocument()
  })

  it('cancel button calls onClose callback', () => {
    renderPanel()
    const cancelButton = screen.getByLabelText('cancel-properNoun-creation')
    fireEvent.click(cancelButton)
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it('create button is disabled when input is empty', () => {
    renderPanel()
    const createButton = screen.getByLabelText('save-properNoun-creation')
    expect(createButton).toBeDisabled()
  })

  it('create button is disabled when input contains only whitespace', async () => {
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')
    const createButton = screen.getByLabelText('save-properNoun-creation')
    fireEvent.change(input, { target: { value: '   ' } })
    await waitFor(() => {
      expect(createButton).toBeDisabled()
    })
  })

  it('create button is disabled when named entity tag is not selected', async () => {
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')
    const createButton = screen.getByLabelText('save-properNoun-creation')
    fireEvent.change(input, { target: { value: 'marduk' } })
    await waitFor(() => {
      expect(createButton).toBeDisabled()
    })
  })

  it('create button is enabled when both input and named entity tag are provided', async () => {
    renderPanel()
    expect(await fillProperNounForm('marduk')).toBeEnabled()
  })

  it('create button is disabled when exact match exists', async () => {
    const exactMatchWord: Word = wordFactory.build({
      _id: 'Marduk I',
      lemma: ['Marduk'],
      homonym: 'I',
    })
    wordServiceMock.searchLemma.mockResolvedValue([exactMatchWord])
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')
    const createButton = screen.getByLabelText('save-properNoun-creation')
    fireEvent.change(input, { target: { value: 'marduk' } })
    await waitFor(() => {
      expect(createButton).toBeDisabled()
    })
  })

  it('create button is enabled when length match exists but no exact match', async () => {
    const lengthMatchWord: Word = wordFactory.build({
      _id: 'Shamash I',
      lemma: ['Shamash'],
      homonym: 'I',
    })
    wordServiceMock.searchLemma.mockResolvedValue([lengthMatchWord])
    renderPanel()
    expect(await fillProperNounForm('enlilzu')).toBeEnabled()
  })

  it('create button calls onClose when clicked', async () => {
    renderPanel()
    fireEvent.click(await fillProperNounForm('marduk'))
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })
  })

  it('displays correct button text', () => {
    renderPanel()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Create & Save')).toBeInTheDocument()
  })
})

describe('Integration Tests', () => {
  it('allows complete workflow: input -> select named entity tag -> create', async () => {
    renderPanel()
    fireEvent.click(await fillProperNounForm('shamash'))
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })
  })

  it('workflow can be cancelled at any point', async () => {
    renderPanel()
    await fillProperNounForm('shamash')
    fireEvent.click(screen.getByLabelText('cancel-properNoun-creation'))
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })
})
