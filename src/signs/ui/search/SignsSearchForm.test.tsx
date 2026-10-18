import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, RenderResult, screen } from '@testing-library/react'

import SignsSearchForm from 'signs/ui/search/SignsSearchForm'
import userEvent from '@testing-library/user-event'
import { SignQuery } from 'signs/domain/Sign'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

it('Adds lemma to query string on submit', async () => {
  renderSignsSearchForm()
  await userEvent.type(screen.getByPlaceholderText('Sign or Reading'), 'ba')
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).toHaveBeenCalledWith(
    '?listsName&listsNumber&sign=ba&subIndex=1&value=ba',
  )
})

it('Extracts subIndex from accent-encoded sign on submit', async () => {
  renderSignsSearchForm()
  await userEvent.type(screen.getByPlaceholderText('Sign or Reading'), 'šá')
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).toHaveBeenCalledWith(
    '?listsName&listsNumber&sign=%C5%A1a%E2%82%82&subIndex=2&value=%C5%A1a',
  )
})

it('Prefers explicit subIndex over accent-encoded subIndex on submit', async () => {
  renderSignsSearchForm()
  await userEvent.type(screen.getByPlaceholderText('Sign or Reading'), 'šá3')
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).toHaveBeenCalledWith(
    '?listsName&listsNumber&sign=%C5%A1a3%E2%82%82&subIndex=3&value=%C5%A1a',
  )
})

it('Uses explicit subIndex without accent on submit', async () => {
  renderSignsSearchForm()
  await userEvent.type(screen.getByPlaceholderText('Sign or Reading'), 'ba2')
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).toHaveBeenCalledWith(
    '?listsName&listsNumber&sign=ba%E2%82%82&subIndex=2&value=ba',
  )
})

it('Does not navigate without a sign', async () => {
  renderSignsSearchForm()
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).not.toHaveBeenCalled()
})

it('Does not navigate after the sign is cleared', async () => {
  renderSignsSearchForm()
  await userEvent.type(screen.getByPlaceholderText('Sign or Reading'), 'ba')
  await userEvent.clear(screen.getByPlaceholderText('Sign or Reading'))
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).not.toHaveBeenCalled()
})

it('Queries an empty value for a sign without letters', async () => {
  renderSignsSearchForm()
  await userEvent.type(screen.getByPlaceholderText('Sign or Reading'), '1')
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).toHaveBeenCalledWith(
    '?listsName&listsNumber&sign=1&subIndex=1&value=',
  )
})

it('Prefills the query from the sign query value and subIndex', async () => {
  renderSignsSearchForm({ value: 'ba', subIndex: 2 }, 'ba₂')
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).toHaveBeenCalledWith(
    '?listsName&listsNumber&sign=ba%E2%82%82&subIndex=2&value=ba',
  )
})

it('Prefills the query from the sign query value without subIndex', async () => {
  renderSignsSearchForm({ value: 'ba' }, 'ba')
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).toHaveBeenCalledWith(
    '?listsName&listsNumber&sign=ba&subIndex=1&value=ba',
  )
})

it('Toggles homophones and composite signs exclusively', async () => {
  renderSignsSearchForm()
  await userEvent.type(screen.getByPlaceholderText('Sign or Reading'), 'ba')
  await userEvent.click(screen.getByLabelText('Include Homophones'))
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).toHaveBeenLastCalledWith(
    '?isComposite=false&isIncludeHomophones=true&listsName&listsNumber&sign=ba&subIndex=1&value=ba',
  )

  await userEvent.click(screen.getByLabelText('Composite Signs'))
  await userEvent.click(screen.getAllByRole('button')[0])

  expect(mockNavigate).toHaveBeenLastCalledWith(
    '?isComposite=true&isIncludeHomophones=false&listsName&listsNumber&sign=ba&subIndex=1&value=ba',
  )
})

it('Queries a sign list by name and number', async () => {
  renderSignsSearchForm()
  await userEvent.selectOptions(screen.getByRole('combobox'), 'MZL')
  await userEvent.type(screen.getByPlaceholderText('Number'), '123')
  await userEvent.click(screen.getAllByRole('button')[1])

  expect(mockNavigate).toHaveBeenCalledWith('?listsName=MZL&listsNumber=123')
})

it('Does not query a sign list without a number', async () => {
  renderSignsSearchForm()
  await userEvent.selectOptions(screen.getByRole('combobox'), 'MZL')
  await userEvent.click(screen.getAllByRole('button')[1])

  expect(mockNavigate).not.toHaveBeenCalled()
})

function renderSignsSearchForm(
  signQuery: Partial<SignQuery> = {},
  sign: string | undefined = undefined,
): RenderResult {
  const signQueryDefault: Partial<SignQuery> = {
    value: undefined,
    subIndex: undefined,
    listsName: undefined,
    listsNumber: undefined,
    isIncludeHomophones: undefined,
    isComposite: undefined,
    ...signQuery,
  }
  return render(
    <MemoryRouter>
      <SignsSearchForm sign={sign} signQuery={signQueryDefault} />
    </MemoryRouter>,
  )
}
