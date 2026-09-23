import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AfoRegisterSearchForm, {
  AfoRegisterQuery,
} from 'afo-register/ui/AfoRegisterSearchForm'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { MemoryRouter } from 'react-router-dom'
import { AfoRegisterRecordSuggestion } from 'afo-register/domain/Record'

jest.mock('afo-register/application/AfoRegisterService')

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const routerFuture = Object.fromEntries([
  ['v7_startTransition', true],
  ['v7_relativeSplatPath', true],
])

let afoRegisterServiceMock: jest.Mocked<AfoRegisterService>

function renderSearchForm(queryProp: AfoRegisterQuery): {
  unmount: () => void
} {
  const { unmount } = render(
    <MemoryRouter future={routerFuture}>
      <AfoRegisterSearchForm
        queryProp={queryProp}
        afoRegisterService={afoRegisterServiceMock}
      />
    </MemoryRouter>,
  )
  return { unmount }
}

beforeEach(() => {
  mockNavigate.mockClear()
  afoRegisterServiceMock = new (AfoRegisterService as jest.Mock<
    jest.Mocked<AfoRegisterService>
  >)()
  afoRegisterServiceMock.searchSuggestions.mockResolvedValue([
    new AfoRegisterRecordSuggestion({
      text: 'Sample text',
      textNumbers: ['1', '2', '3', '4'],
    }),
  ])
})

it('does not search suggestions for a single-character query', async () => {
  renderSearchForm({ text: 'a', textNumber: '' })

  await screen.findByPlaceholderText('Number')
  expect(afoRegisterServiceMock.searchSuggestions).not.toHaveBeenCalled()
})

it('does not load options when the request is aborted by unmounting', async () => {
  let resolveSuggestions: (
    suggestions: readonly AfoRegisterRecordSuggestion[],
  ) => void = () => undefined
  afoRegisterServiceMock.searchSuggestions.mockReturnValue(
    new Promise((resolve) => {
      resolveSuggestions = resolve
    }),
  )

  const { unmount } = renderSearchForm({ text: 'Sample text', textNumber: '' })

  await waitFor(() =>
    expect(afoRegisterServiceMock.searchSuggestions).toHaveBeenCalled(),
  )
  unmount()
  resolveSuggestions([
    new AfoRegisterRecordSuggestion({
      text: 'Sample text',
      textNumbers: ['1', '2'],
    }),
  ])

  await waitFor(() => expect(screen.queryByText('—')).not.toBeInTheDocument())
})

it('does not show an error when loading suggestions is cancelled', async () => {
  afoRegisterServiceMock.searchSuggestions.mockRejectedValue(
    new DOMException('The operation was aborted.', 'AbortError'),
  )

  renderSearchForm({ text: 'Sample text', textNumber: '' })

  await waitFor(() =>
    expect(afoRegisterServiceMock.searchSuggestions).toHaveBeenCalled(),
  )
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('handles suggestions that carry no text numbers', async () => {
  afoRegisterServiceMock.searchSuggestions.mockResolvedValue([
    new AfoRegisterRecordSuggestion({ text: 'Numberless text' }),
  ])
  renderSearchForm({ text: '', textNumber: '' })

  await userEvent.type(screen.getByLabelText('Select text'), 'Numberless')
  await userEvent.click(await screen.findByText('Numberless text'))

  await userEvent.click(screen.getByLabelText('Exact number'))
  await userEvent.click(screen.getByLabelText('select-text-number'))

  expect(await screen.findByText('—')).toBeInTheDocument()
})

it('keeps the text number when the number select is cleared', async () => {
  renderSearchForm({ text: 'Sample text', textNumber: '' })

  await waitFor(() =>
    expect(afoRegisterServiceMock.searchSuggestions).toHaveBeenCalled(),
  )
  await userEvent.click(screen.getByLabelText('Exact number'))
  await userEvent.click(screen.getByLabelText('select-text-number'))
  await userEvent.click(await screen.findByText('3'))

  await userEvent.type(
    screen.getByLabelText('select-text-number'),
    '{backspace}',
  )

  await userEvent.click(screen.getByRole('button', { name: /search/i }))
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith(
      '?text=Sample%20text&textNumber=%223%22',
    ),
  )
})

it('shows an error when loading suggestions fails', async () => {
  afoRegisterServiceMock.searchSuggestions.mockRejectedValue(
    new Error('suggestions failed'),
  )

  renderSearchForm({ text: 'Sample text', textNumber: '' })

  expect(await screen.findByText(/suggestions failed/)).toBeInTheDocument()
})

it('quotes the text number when the exact switch is on', async () => {
  renderSearchForm({ text: 'Sample text', textNumber: '"1"' })

  await waitFor(() =>
    expect(afoRegisterServiceMock.searchSuggestions).toHaveBeenCalled(),
  )
  await userEvent.click(screen.getByRole('button', { name: /search/i }))

  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith(
      '?text=Sample%20text&textNumber=%221%22',
    ),
  )
})

it('selects a text suggestion and resets the text number', async () => {
  renderSearchForm({ text: '', textNumber: '' })

  await userEvent.type(screen.getByLabelText('Select text'), 'Sample')
  await userEvent.click(await screen.findByText('Sample text'))

  await waitFor(() =>
    expect(afoRegisterServiceMock.searchSuggestions).toHaveBeenCalledWith(
      'Sample',
    ),
  )
  await userEvent.click(screen.getByRole('button', { name: /search/i }))

  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith(
      '?text=Sample%20text&textNumber=',
    ),
  )
})

it('selects a text number from the exact-number options', async () => {
  renderSearchForm({ text: 'Sample text', textNumber: '' })

  await waitFor(() =>
    expect(afoRegisterServiceMock.searchSuggestions).toHaveBeenCalled(),
  )
  await userEvent.click(screen.getByLabelText('Exact number'))
  await userEvent.click(screen.getByLabelText('select-text-number'))
  await userEvent.click(await screen.findByText('3'))

  await userEvent.click(screen.getByRole('button', { name: /search/i }))

  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith(
      '?text=Sample%20text&textNumber=%223%22',
    ),
  )
})
