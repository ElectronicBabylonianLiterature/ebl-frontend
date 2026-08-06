import { screen, fireEvent, waitFor } from '@testing-library/react'
import { wordFactory } from 'test-support/word-fixtures'
import Word from 'dictionary/domain/Word'
import {
  createProperNounPanelTestContext,
  fillProperNounForm,
  resetProperNounPanelMocks,
} from 'fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.testSupport'

jest.mock('dictionary/application/WordService')

const { wordServiceMock, onCloseMock, onCreatedMock, renderPanel } =
  createProperNounPanelTestContext()

const testWord = wordFactory.build({
  _id: 'Shamash DN',
  lemma: ['Shamash'],
})

beforeEach(() => {
  resetProperNounPanelMocks(wordServiceMock)
})

describe('Create Proper Noun', () => {
  it('calls createProperNoun with lemma and named entity tag', async () => {
    wordServiceMock.createProperNoun.mockResolvedValue(testWord)
    renderPanel()

    fireEvent.click(await fillProperNounForm('shamash'))

    await waitFor(() => {
      expect(wordServiceMock.createProperNoun).toHaveBeenCalledWith(
        'Shamash',
        'DN',
      )
    })
  })

  it('calls createProperNoun with trimmed normalized lemma', async () => {
    wordServiceMock.createProperNoun.mockResolvedValue(testWord)
    renderPanel()

    fireEvent.click(await fillProperNounForm('  shamash  '))

    await waitFor(() => {
      expect(wordServiceMock.createProperNoun).toHaveBeenCalledWith(
        'Shamash',
        'DN',
      )
    })
  })

  it('closes modal on successful creation', async () => {
    wordServiceMock.createProperNoun.mockResolvedValue(testWord)
    renderPanel()

    fireEvent.click(await fillProperNounForm('shamash'))

    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })
  })

  it('calls onCreated with the created word on successful creation', async () => {
    wordServiceMock.createProperNoun.mockResolvedValue(testWord)
    renderPanel()

    fireEvent.click(await fillProperNounForm('shamash'))

    await waitFor(() => {
      expect(onCreatedMock).toHaveBeenCalledWith(testWord)
    })
  })

  it('disables button during creation', async () => {
    const delayedPromise = new Promise<Word>((resolve) =>
      setTimeout(() => resolve(testWord), 100),
    )
    wordServiceMock.createProperNoun.mockReturnValue(delayedPromise)
    renderPanel()

    const createButton = await fillProperNounForm('shamash')
    fireEvent.click(createButton)

    expect(createButton).toBeDisabled()

    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled()
    })
  })

  it('displays error message on creation failure', async () => {
    const errorMessage = 'Failed to create proper noun'
    wordServiceMock.createProperNoun.mockRejectedValue(new Error(errorMessage))
    renderPanel()

    fireEvent.click(await fillProperNounForm('shamash'))

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('shows error and stays open when backend returns invalid payload', async () => {
    wordServiceMock.createProperNoun.mockResolvedValue(null as unknown as Word)
    renderPanel()

    fireEvent.click(await fillProperNounForm('shamash'))

    expect(
      await screen.findByText(
        'Proper noun creation failed: backend did not return a valid word document.',
      ),
    ).toBeInTheDocument()
    expect(onCloseMock).not.toHaveBeenCalled()
    expect(onCreatedMock).not.toHaveBeenCalled()
  })

  it('shows error alert with danger variant', async () => {
    const errorMessage = 'Failed to create proper noun'
    wordServiceMock.createProperNoun.mockRejectedValue(new Error(errorMessage))
    renderPanel()

    fireEvent.click(await fillProperNounForm('shamash'))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveClass('alert-danger')
  })

  it('re-enables button after error', async () => {
    const error = new Error('Failed to create proper noun')
    wordServiceMock.createProperNoun.mockRejectedValue(error)
    renderPanel()

    const createButton = await fillProperNounForm('shamash')
    fireEvent.click(createButton)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(error.message)

    expect(createButton).toBeEnabled()
  })

  it('clears error when user modifies input after error', async () => {
    const error = new Error('Creation failed')
    wordServiceMock.createProperNoun.mockRejectedValue(error)
    renderPanel()

    const createButton = await fillProperNounForm('shamash')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Creation failed')).toBeInTheDocument()
    })

    wordServiceMock.createProperNoun.mockResolvedValue(testWord)
    fireEvent.change(screen.getByLabelText('properNoun-input'), {
      target: { value: 'marduk' },
    })

    await waitFor(() => {
      expect(createButton).toBeEnabled()
    })

    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.queryByText('Creation failed')).not.toBeInTheDocument()
    })
  })

  it('handles different named entity tags correctly', async () => {
    const tagsToTest = ['DN', 'PN', 'GN']

    for (const tag of tagsToTest) {
      jest.clearAllMocks()
      wordServiceMock.createProperNoun.mockResolvedValue(testWord)
      const { unmount } = renderPanel()

      fireEvent.click(await fillProperNounForm('testname', tag))

      await waitFor(() => {
        expect(wordServiceMock.createProperNoun).toHaveBeenCalledWith(
          'Testname',
          tag,
        )
      })

      unmount()
    }
  })
})
