import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProperNounCreationPanel from './ProperNounCreationPanel'
import WordService from 'dictionary/application/WordService'
import { wordFactory } from 'test-support/word-fixtures'
import Word from 'dictionary/domain/Word'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()
const onCloseMock = jest.fn()

const renderPanel = () => {
  render(
    <ProperNounCreationPanel
      wordService={wordServiceMock}
      onClose={onCloseMock}
    />
  )
}

describe('ProperNounCreationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    wordServiceMock.searchLemma.mockResolvedValue([])
  })

  describe('Input Validation', () => {
    it('renders the input field with correct label', () => {
      renderPanel()
      expect(screen.getByLabelText('properNoun-input')).toBeInTheDocument()
      expect(screen.getByText('Proper Noun Name')).toBeInTheDocument()
    })

    it('capitalizes the first letter of input', async () => {
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')

      fireEvent.change(input, { target: { value: 'marduk' } })

      await waitFor(() => {
        expect(input).toHaveValue('Marduk')
      })
    })

    it('filters out non-Latin characters', async () => {
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      fireEvent.change(input, { target: { value: 'Test123@#$' } })
      await waitFor(() => {
        expect(input).toHaveValue('Test')
      })
    })

    it('allows Latin extended characters', async () => {
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      fireEvent.change(input, { target: { value: 'šamaš' } })
      await waitFor(() => {
        expect(input).toHaveValue('Šamaš')
      })
    })

    it('allows spaces and hyphens', async () => {
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      fireEvent.change(input, { target: { value: 'sin-leqi-unninni' } })
      await waitFor(() => {
        expect(input).toHaveValue('Sin-leqi-unninni')
      })
    })

    it('clears input when only non-Latin characters are entered', async () => {
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')

      fireEvent.change(input, { target: { value: '12345' } })

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })
  })

  describe('Lemma Search & Matching Logic', () => {
    it('does not search when input is empty', async () => {
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')

      fireEvent.change(input, { target: { value: '' } })

      await waitFor(() => {
        expect(wordServiceMock.searchLemma).not.toHaveBeenCalled()
      })
    })

    it('does not search when input contains only whitespace', async () => {
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      fireEvent.change(input, { target: { value: '   ' } })
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(wordServiceMock.searchLemma).not.toHaveBeenCalled()
    })

    it('searches for lemmas when input changes', async () => {
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      fireEvent.change(input, { target: { value: 'marduk' } })
      await waitFor(() => {
        expect(wordServiceMock.searchLemma).toHaveBeenCalledWith('Marduk')
      })
    })

    it('displays error when exact match exists', async () => {
      const exactMatchWord: Word = wordFactory.build({
        _id: 'Marduk I',
        lemma: ['Marduk'],
        homonym: 'I',
      })
      wordServiceMock.searchLemma.mockResolvedValue([exactMatchWord])

      renderPanel()
      const input = screen.getByLabelText('properNoun-input')

      fireEvent.change(input, { target: { value: 'marduk' } })

      await waitFor(() => {
        expect(
          screen.getByText(/This lemma already exists/)
        ).toBeInTheDocument()
        expect(screen.getByText(/"Marduk"/)).toBeInTheDocument()
      })
    })

    it('marks input as invalid when exact match exists', async () => {
      const exactMatchWord: Word = wordFactory.build({
        _id: 'Marduk I',
        lemma: ['Marduk'],
        homonym: 'I',
      })
      wordServiceMock.searchLemma.mockResolvedValue([exactMatchWord])
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      fireEvent.change(input, { target: { value: 'marduk' } })
      await waitFor(() => {
        expect(input).toHaveClass('is-invalid')
      })
    })

    it('displays similar lemma warning when length matches', async () => {
      const lengthMatchWord: Word = wordFactory.build({
        _id: 'Shamash I',
        lemma: ['Shamash'],
        homonym: 'I',
      })
      wordServiceMock.searchLemma.mockResolvedValue([lengthMatchWord])
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      fireEvent.change(input, { target: { value: 'enlilzu' } })
      await waitFor(() => {
        expect(screen.getByText(/A similar lemma exists/)).toBeInTheDocument()
        expect(screen.getByText(/"Shamash"/)).toBeInTheDocument()
      })
    })

    it('does not mark input as invalid for length match', async () => {
      const lengthMatchWord: Word = wordFactory.build({
        _id: 'Shamash I',
        lemma: ['Shamash'],
        homonym: 'I',
      })
      wordServiceMock.searchLemma.mockResolvedValue([lengthMatchWord])
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      fireEvent.change(input, { target: { value: 'enlilzu' } })
      await waitFor(() => {
        expect(input).not.toHaveClass('is-invalid')
      })
    })

    it('prefers exact match over length match', async () => {
      const exactMatchWord: Word = wordFactory.build({
        _id: 'Marduk I',
        lemma: ['Marduk'],
        homonym: 'I',
      })
      const lengthMatchWord: Word = wordFactory.build({
        _id: 'Shamash I',
        lemma: ['Shamash'],
        homonym: 'I',
      })
      wordServiceMock.searchLemma.mockResolvedValue([
        exactMatchWord,
        lengthMatchWord,
      ])

      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      fireEvent.change(input, { target: { value: 'marduk' } })
      await waitFor(() => {
        expect(
          screen.getByText(/This lemma already exists/)
        ).toBeInTheDocument()
        expect(
          screen.queryByText(/A similar lemma exists/)
        ).not.toBeInTheDocument()
      })
    })

    it('clears matches when input is cleared', async () => {
      const exactMatchWord: Word = wordFactory.build({
        _id: 'Marduk I',
        lemma: ['Marduk'],
        homonym: 'I',
      })
      wordServiceMock.searchLemma.mockResolvedValue([exactMatchWord])
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      fireEvent.change(input, { target: { value: 'marduk' } })
      await waitFor(() => {
        expect(
          screen.getByText(/This lemma already exists/)
        ).toBeInTheDocument()
      })

      fireEvent.change(input, { target: { value: '' } })
      await waitFor(() => {
        expect(
          screen.queryByText(/This lemma already exists/)
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('POS Tag Selection', () => {
    it('renders the POS tag select with correct label', () => {
      renderPanel()
      expect(screen.getByLabelText('properNoun-pos-select')).toBeInTheDocument()
      expect(screen.getByText('Part of Speech')).toBeInTheDocument()
    })

    it('displays default empty option', () => {
      renderPanel()
      const select = screen.getByLabelText(
        'properNoun-pos-select'
      ) as HTMLSelectElement
      expect(select.value).toBe('')
      expect(screen.getByText('---')).toBeInTheDocument()
    })

    it('displays all proper noun POS tag options', () => {
      renderPanel()
      const expectedOptions = [
        'Divine Name',
        'Ethnos Name',
        'Geographical Name',
        'Month Name',
        'Object Name',
        'Personal Name',
        'Royal Name',
        'Settlement Name',
        'Temple Name',
        'Watercourse Name',
        'Agricultural (locus) Name',
        'Celestial Name',
        'Field Name',
        'Line Name (ancestral clan)',
        'Quarter Name (city area)',
        'Year Name',
      ]

      expectedOptions.forEach((option) => {
        expect(screen.getByText(option)).toBeInTheDocument()
      })
    })

    it('updates POS tag value when option is selected', () => {
      renderPanel()
      const select = screen.getByLabelText(
        'properNoun-pos-select'
      ) as HTMLSelectElement
      fireEvent.change(select, { target: { value: 'DN' } })
      expect(select.value).toBe('DN')
    })

    it('allows changing POS tag multiple times', () => {
      renderPanel()
      const select = screen.getByLabelText(
        'properNoun-pos-select'
      ) as HTMLSelectElement
      fireEvent.change(select, { target: { value: 'DN' } })
      expect(select.value).toBe('DN')
      fireEvent.change(select, { target: { value: 'PN' } })
      expect(select.value).toBe('PN')
      fireEvent.change(select, { target: { value: 'GN' } })
      expect(select.value).toBe('GN')
    })
  })

  describe('Button States & Callbacks', () => {
    it('renders cancel and create buttons', () => {
      renderPanel()
      expect(
        screen.getByLabelText('cancel-properNoun-creation')
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText('save-properNoun-creation')
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

    it('create button is enabled when valid input is provided', async () => {
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      const createButton = screen.getByLabelText('save-properNoun-creation')
      fireEvent.change(input, { target: { value: 'marduk' } })
      await waitFor(() => {
        expect(createButton).toBeEnabled()
      })
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
      const input = screen.getByLabelText('properNoun-input')
      const createButton = screen.getByLabelText('save-properNoun-creation')
      fireEvent.change(input, { target: { value: 'enlilzu' } })
      await waitFor(() => {
        expect(createButton).toBeEnabled()
      })
    })

    it('create button calls onClose when clicked', async () => {
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      const createButton = screen.getByLabelText('save-properNoun-creation')
      fireEvent.change(input, { target: { value: 'marduk' } })
      await waitFor(() => {
        expect(createButton).toBeEnabled()
      })
      fireEvent.click(createButton)
      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })

    it('displays correct button text', () => {
      renderPanel()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Create & Save')).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('allows complete workflow: input -> select POS -> create', async () => {
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      const select = screen.getByLabelText('properNoun-pos-select')
      const createButton = screen.getByLabelText('save-properNoun-creation')
      fireEvent.change(input, { target: { value: 'shamash' } })
      await waitFor(() => {
        expect(input).toHaveValue('Shamash')
      })
      fireEvent.change(select, { target: { value: 'DN' } })
      await waitFor(() => {
        expect(createButton).toBeEnabled()
      })
      fireEvent.click(createButton)
      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })

    it('workflow can be cancelled at any point', async () => {
      renderPanel()
      const input = screen.getByLabelText('properNoun-input')
      const select = screen.getByLabelText('properNoun-pos-select')
      const cancelButton = screen.getByLabelText('cancel-properNoun-creation')
      fireEvent.change(input, { target: { value: 'shamash' } })
      fireEvent.change(select, { target: { value: 'DN' } })
      await waitFor(() => {
        expect(input).toHaveValue('Shamash')
      })
      fireEvent.click(cancelButton)
      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })
  })
})
