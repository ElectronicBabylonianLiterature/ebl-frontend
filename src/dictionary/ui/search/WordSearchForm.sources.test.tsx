import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { submitForm } from 'test-support/utils'
import { WordQuery } from 'dictionary/application/WordService'
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

it('Defaults to CDA when no origin provided', async () => {
  const { container } = renderWordSearchForm({
    word: '',
    meaning: '',
    root: '',
    vowelClass: [],
  })

  expect(
    screen.getByRole('checkbox', { name: 'All sources' }),
  ).not.toBeChecked()
  expect(
    screen.getByRole('checkbox', { name: 'Concise Dictionary of Akkadian' }),
  ).toBeChecked()

  await submitForm(container)
  expect(mockNavigate).toHaveBeenCalledWith('?origin=CDA')
})

it('Parses string inputs for vowelClass and origin into arrays', () => {
  renderWordSearchForm({
    word: '',
    meaning: '',
    root: '',
    vowelClass: ['a/i'],
    origin: ['AFO_REGISTER'],
  })

  expect(screen.getByRole('checkbox', { name: 'a/i' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'AfO Register' })).toBeChecked()
})

it('Wraps plain string vowelClass and origin into arrays', () => {
  const urlQuery: WordQuery = JSON.parse(
    '{"word":"","meaning":"","root":"","vowelClass":"a/u","origin":"SAD"}',
  )
  renderWordSearchForm(urlQuery)

  expect(screen.getByRole('checkbox', { name: 'a/u' })).toBeChecked()
  expect(
    screen.getByRole('checkbox', {
      name: 'Supplements to the Akkadian Dictionaries',
    }),
  ).toBeChecked()
})

it('Allows selecting a source when All sources is on', async () => {
  renderWordSearchForm({
    word: '',
    meaning: '',
    root: '',
    vowelClass: [],
    origin: [],
  })

  const allSwitch = screen.getByRole('checkbox', { name: 'All sources' })
  expect(allSwitch).toBeChecked()

  const afoSwitch = screen.getByRole('checkbox', { name: 'AfO Register' })
  await userEvent.click(afoSwitch)

  expect(allSwitch).not.toBeChecked()
  expect(afoSwitch).toBeChecked()
})

it('Toggles all sources off then back to CDA', async () => {
  renderWordSearchForm(query)

  const allSwitch = screen.getByRole('checkbox', { name: 'All sources' })
  expect(allSwitch).not.toBeChecked()

  await userEvent.click(allSwitch)
  expect(allSwitch).toBeChecked()

  await userEvent.click(allSwitch)
  expect(allSwitch).not.toBeChecked()
  expect(
    screen.getByRole('checkbox', { name: 'Concise Dictionary of Akkadian' }),
  ).toBeChecked()
})

it('Submits multiple origins as repeated params', async () => {
  renderWordSearchForm(query)

  const wordInput = screen.getByPlaceholderText('word')
  fireEvent.change(wordInput, { target: { value: 'test' } })

  await userEvent.click(screen.getByRole('checkbox', { name: 'All sources' }))
  await userEvent.click(
    screen.getByRole('checkbox', { name: 'Concise Dictionary of Akkadian' }),
  )
  await userEvent.click(
    screen.getByRole('checkbox', {
      name: 'Supplements to the Akkadian Dictionaries',
    }),
  )

  await userEvent.click(screen.getByRole('button', { name: 'Query' }))

  expect(mockNavigate).toHaveBeenCalled()
  const callArg = mockNavigate.mock.calls[0][0]
  expect(callArg).toContain('word=test')
  expect(callArg).toContain('origin=CDA')
  expect(callArg).toContain('origin=SAD')
})

it('Removes origin when unchecked', async () => {
  renderWordSearchForm({
    word: 'test',
    meaning: '',
    root: '',
    vowelClass: [],
    origin: ['CDA', 'AFO_REGISTER'],
  })

  const afoCheckbox = screen.getByRole('checkbox', { name: 'AfO Register' })
  expect(afoCheckbox).toBeChecked()

  await userEvent.click(afoCheckbox)
  expect(afoCheckbox).not.toBeChecked()

  await userEvent.click(screen.getByRole('button', { name: 'Query' }))
  expect(mockNavigate).toHaveBeenCalled()
  const callArg = mockNavigate.mock.calls[0][0]
  expect(callArg).toContain('word=test')
  expect(callArg).toContain('origin=CDA')
  expect(callArg).not.toContain('AFO_REGISTER')
})
