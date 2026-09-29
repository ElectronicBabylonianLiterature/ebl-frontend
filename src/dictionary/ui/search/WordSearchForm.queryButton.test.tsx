import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
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

it('Disables Query button when all fields are empty', () => {
  renderWordSearchForm(query)

  const queryButton = screen.getByRole('button', { name: 'Query' })
  expect(queryButton).toBeDisabled()
})

it.each([
  ['word', 'test'],
  ['meaning', 'test meaning'],
  ['root', 'test'],
])('Enables Query button when %s field has content', (field, value) => {
  renderWordSearchForm(query)

  fireEvent.change(screen.getByPlaceholderText(field), { target: { value } })

  const queryButton = screen.getByRole('button', { name: 'Query' })
  expect(queryButton).toBeEnabled()
})

it('Enables Query button when vowel class is selected', async () => {
  renderWordSearchForm(query)

  const vowelCheckbox = screen.getByRole('checkbox', { name: 'a/a' })
  await userEvent.click(vowelCheckbox)

  const queryButton = screen.getByRole('button', { name: 'Query' })
  expect(queryButton).toBeEnabled()
})
