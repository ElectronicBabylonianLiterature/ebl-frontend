import { screen, fireEvent, waitFor } from '@testing-library/react'
import { wordFactory } from 'test-support/word-fixtures'
import Word from 'dictionary/domain/Word'
import {
  createProperNounPanelTestContext,
  resetProperNounPanelMocks,
} from 'fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.testSupport'

jest.mock('dictionary/application/WordService')

const { wordServiceMock, renderPanel } = createProperNounPanelTestContext()

const staleWord: Word = wordFactory.build({ _id: 'Adad I', lemma: ['Adad'] })
const enlilWord: Word = wordFactory.build({ _id: 'Enlil I', lemma: ['Enlil'] })

beforeEach(() => {
  resetProperNounPanelMocks(wordServiceMock)
})

describe('Stale lemma searches', () => {
  it('ignores results of a search for a replaced input', async () => {
    let resolveStaleSearch: (words: Word[]) => void = jest.fn()
    wordServiceMock.searchLemma.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveStaleSearch = resolve
      }),
    )
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')

    fireEvent.change(input, { target: { value: 'Adad' } })
    fireEvent.change(input, { target: { value: 'Enlil' } })
    await waitFor(() =>
      expect(wordServiceMock.searchLemma).toHaveBeenCalledWith('Enlil'),
    )
    resolveStaleSearch([staleWord])

    await waitFor(() => expect(input).toHaveValue('Enlil'))
    expect(screen.queryByText(/Adad/)).not.toBeInTheDocument()
  })

  it('ignores failures of a search for a replaced input', async () => {
    let rejectStaleSearch: (error: Error) => void = jest.fn()
    wordServiceMock.searchLemma
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          rejectStaleSearch = reject
        }),
      )
      .mockResolvedValueOnce([enlilWord])
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')

    fireEvent.change(input, { target: { value: 'Adad' } })
    fireEvent.change(input, { target: { value: 'Enlil' } })
    expect(
      await screen.findByText(/This lemma already exists/),
    ).toBeInTheDocument()
    rejectStaleSearch(new Error('stale'))

    await waitFor(() => expect(input).toHaveValue('Enlil'))
    expect(screen.getByText(/This lemma already exists/)).toBeInTheDocument()
  })
})
