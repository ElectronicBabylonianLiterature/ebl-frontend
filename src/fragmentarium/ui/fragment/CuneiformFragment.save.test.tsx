import { fireEvent, screen, waitFor } from '@testing-library/react'
import { submitFormByTestId, clickNth } from 'test-support/utils'
import {
  CuneiformFragmentTestContext,
  setUpCuneiformFragment,
} from 'fragmentarium/ui/fragment/CuneiformFragment.testSupport'
import ResizeObserver from 'resize-observer-polyfill'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FindspotService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('afo-register/application/AfoRegisterService')
jest.mock('auth/Session')

global.ResizeObserver = ResizeObserver

let context: CuneiformFragmentTestContext

const setup = async (): Promise<void> => {
  context = await setUpCuneiformFragment()
}

it('Updates view on Edition save', async () => {
  await setup()
  context.fragmentService.updateEdition.mockReturnValueOnce(
    Promise.resolve(context.updatedFragment),
  )

  submitFormByTestId(screen, 'transliteration-form')

  await screen.findAllByText(
    context.updatedFragment.getExternalNumber('cdliNumber'),
  )
})

it('Updates view on References save', async () => {
  await setup()
  context.fragmentService.updateReferences.mockReturnValueOnce(
    Promise.resolve(context.updatedFragment),
  )
  clickNth(screen, 'References', 1)
  await screen.findAllByText('Document')
  submitFormByTestId(screen, 'references-form')

  await screen.findByText(
    context.updatedFragment.getExternalNumber('cdliNumber'),
  )
})

it('Calls `updateDate` on Date save', async () => {
  await setup()
  context.fragmentService.updateDate.mockReturnValueOnce(
    Promise.resolve(context.updatedFragment),
  )
  const editButton = screen.getAllByLabelText('Edit date button')[0]
  fireEvent.click(editButton)
  const dayInput = screen.getByPlaceholderText('Day')
  fireEvent.change(dayInput, { target: { value: '3' } })
  const saveButton = screen.getByLabelText('Save date button')
  fireEvent.click(saveButton)
  expect(screen.getByText('Saving...')).toBeInTheDocument()
  await waitFor(() =>
    expect(context.fragmentService.updateDate).toHaveBeenCalledTimes(1),
  )
})

it('Calls `updateDate` with undefined on Date delete', async () => {
  await setup()
  context.fragmentService.updateDate.mockReturnValueOnce(
    Promise.resolve(context.fragment),
  )

  const editButton = screen.getAllByLabelText('Edit date button')[0]
  fireEvent.click(editButton)

  const deleteButton = await screen.findByText('Delete')
  fireEvent.click(deleteButton)

  expect(screen.getByText('Saving...')).toBeInTheDocument()
  await waitFor(() =>
    expect(context.fragmentService.updateDate).toHaveBeenCalledWith(
      context.fragment.number,
      undefined,
    ),
  )
})

it('Calls `updateDatesInText` on Dates in text save', async () => {
  await setup()
  context.fragmentService.updateDatesInText.mockReturnValueOnce(
    Promise.resolve(context.updatedFragment),
  )
  const addButton = screen.getByLabelText('Add date button')
  fireEvent.click(addButton)
  const dayInput = screen.getByPlaceholderText('Day')
  fireEvent.change(dayInput, { target: { value: '3' } })
  const saveButton = screen.getByLabelText('Save date button')
  fireEvent.click(saveButton)
  await waitFor(() =>
    expect(context.fragmentService.updateDatesInText).toHaveBeenCalledTimes(1),
  )
})
