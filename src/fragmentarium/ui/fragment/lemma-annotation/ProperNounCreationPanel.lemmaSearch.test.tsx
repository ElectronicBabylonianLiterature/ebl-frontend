import { screen, fireEvent, waitFor } from '@testing-library/react'
import { wordFactory } from 'test-support/word-fixtures'
import Word from 'dictionary/domain/Word'
import {
  createProperNounPanelTestContext,
  resetProperNounPanelMocks,
} from 'fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.testSupport'

jest.mock('dictionary/application/WordService')

const { wordServiceMock, renderPanel } = createProperNounPanelTestContext()

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

beforeEach(() => {
  resetProperNounPanelMocks(wordServiceMock)
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

  it('searches with normalized trimmed input', async () => {
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')
    fireEvent.change(input, { target: { value: '  marduk  ' } })
    await waitFor(() => {
      expect(wordServiceMock.searchLemma).toHaveBeenCalledWith('Marduk')
    })
  })

  it('displays error when exact match exists', async () => {
    wordServiceMock.searchLemma.mockResolvedValue([exactMatchWord])

    renderPanel()
    const input = screen.getByLabelText('properNoun-input')

    fireEvent.change(input, { target: { value: 'marduk' } })

    expect(
      await screen.findByText(/This lemma already exists/),
    ).toBeInTheDocument()
    expect(screen.getByText(/"Marduk"/)).toBeInTheDocument()
  })

  it('marks input as invalid when exact match exists', async () => {
    wordServiceMock.searchLemma.mockResolvedValue([exactMatchWord])
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')
    fireEvent.change(input, { target: { value: 'marduk' } })
    await waitFor(() => {
      expect(input).toHaveClass('is-invalid')
    })
  })

  it('displays similar lemma warning when length matches', async () => {
    wordServiceMock.searchLemma.mockResolvedValue([lengthMatchWord])
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')
    fireEvent.change(input, { target: { value: 'enlilzu' } })
    expect(
      await screen.findByText(/A similar lemma exists/),
    ).toBeInTheDocument()
    expect(screen.getByText(/"Shamash"/)).toBeInTheDocument()
  })

  it('does not mark input as invalid for length match', async () => {
    wordServiceMock.searchLemma.mockResolvedValue([lengthMatchWord])
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')
    fireEvent.change(input, { target: { value: 'enlilzu' } })
    await waitFor(() => {
      expect(input).not.toHaveClass('is-invalid')
    })
  })

  it('prefers exact match over length match', async () => {
    wordServiceMock.searchLemma.mockResolvedValue([
      exactMatchWord,
      lengthMatchWord,
    ])

    renderPanel()
    const input = screen.getByLabelText('properNoun-input')
    fireEvent.change(input, { target: { value: 'marduk' } })
    expect(
      await screen.findByText(/This lemma already exists/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/A similar lemma exists/)).not.toBeInTheDocument()
  })

  it('clears matches when input is cleared', async () => {
    wordServiceMock.searchLemma.mockResolvedValue([exactMatchWord])
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')
    fireEvent.change(input, { target: { value: 'marduk' } })
    await waitFor(() => {
      expect(screen.getByText(/This lemma already exists/)).toBeInTheDocument()
    })

    fireEvent.change(input, { target: { value: '' } })
    await waitFor(() => {
      expect(
        screen.queryByText(/This lemma already exists/),
      ).not.toBeInTheDocument()
    })
  })

  it('clears match state when lemma search fails', async () => {
    wordServiceMock.searchLemma
      .mockResolvedValueOnce([exactMatchWord])
      .mockRejectedValueOnce(new Error('Search failed'))

    renderPanel()
    const input = screen.getByLabelText('properNoun-input')

    fireEvent.change(input, { target: { value: 'marduk' } })

    expect(
      await screen.findByText(/This lemma already exists/),
    ).toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'shamash' } })

    await waitFor(() => {
      expect(
        screen.queryByText(/This lemma already exists/),
      ).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(input).not.toHaveClass('is-invalid')
    })
  })
})
