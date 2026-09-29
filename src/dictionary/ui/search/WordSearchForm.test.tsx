import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { changeValueByLabel, submitForm } from 'test-support/utils'
import { stringify } from 'query-string'
import {
  modifiedQuery,
  query,
  renderWordSearchForm,
} from 'dictionary/ui/search/WordSearchForm.testSupport'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

beforeEach(() => {
  mockNavigate.mockClear()
})

it('Adds lemma to query string on submit', async () => {
  const { container } = renderWordSearchForm(query)

  changeValueByLabel(screen, 'Word', 'lemma')
  changeValueByLabel(screen, 'Meaning', 'some meaning')
  changeValueByLabel(screen, 'Root', 'lmm')
  await userEvent.click(screen.getByRole('checkbox', { name: 'a/a' }))
  await submitForm(container)

  expect(mockNavigate).toHaveBeenCalledWith(`?${stringify(modifiedQuery)}`)
})

it('Applies transliteration on word and root change', async () => {
  renderWordSearchForm(query)

  const wordInput = screen.getByPlaceholderText('word')
  fireEvent.change(wordInput, { target: { value: 'sz' } })
  expect(wordInput).toHaveValue('š')

  const rootInput = screen.getByPlaceholderText('root')
  fireEvent.change(rootInput, { target: { value: 's,' } })
  expect(rootInput).toHaveValue('ṣ')
})

it('Removes vowel when unchecked', async () => {
  renderWordSearchForm(query)

  const wordInput = screen.getByPlaceholderText('word')
  fireEvent.change(wordInput, { target: { value: 'test' } })

  const vowelCheckbox = screen.getByRole('checkbox', { name: 'a/a' })
  await userEvent.click(vowelCheckbox)
  expect(vowelCheckbox).toBeChecked()

  await userEvent.click(vowelCheckbox)
  expect(vowelCheckbox).not.toBeChecked()

  await userEvent.click(screen.getByRole('button', { name: 'Query' }))

  expect(mockNavigate).toHaveBeenCalled()
  const callArg = mockNavigate.mock.calls[0][0]
  expect(callArg).toContain('word=test')
  expect(callArg).toContain('origin=CDA')
})

it('Allows changing meaning field without transliteration', async () => {
  renderWordSearchForm(query)

  const meaningInput = screen.getByPlaceholderText('meaning')
  fireEvent.change(meaningInput, { target: { value: 'to drink' } })
  expect(meaningInput).toHaveValue('to drink')

  await userEvent.click(screen.getByRole('button', { name: 'Query' }))
  expect(mockNavigate).toHaveBeenCalledWith(
    expect.stringMatching(/meaning=to%20drink/),
  )
})
