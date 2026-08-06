import { fireEvent, screen, waitFor } from '@testing-library/react'
import { submitFormByTestId } from 'test-support/utils'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
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

it('Shows an error when saving fails', async () => {
  await setup()
  context.fragmentService.updateEdition.mockReturnValueOnce(
    Promise.reject(new Error('Save failed')),
  )

  submitFormByTestId(screen, 'transliteration-form')

  expect(await screen.findByText('Save failed')).toBeInTheDocument()
  expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
})

it('Hides and shows the image column', async () => {
  await setup()
  const toggleButton = screen.getByRole('button', {
    name: /Hide Image Column/,
  })

  fireEvent.click(toggleButton)

  await waitFor(() => expect(screen.queryAllByText('Photo')).toHaveLength(0))

  fireEvent.click(screen.getByRole('button', { name: /Show Image Column/ }))

  await waitFor(() =>
    expect(screen.getAllByText('Photo').length).toBeGreaterThan(0),
  )
})

it('Ignores a superseded save outcome', async () => {
  await setup()
  let resolveFirstSave: (saved: Fragment) => void = () => undefined
  const staleFragment = fragmentFactory.build({
    number: context.fragment.number,
  })
  context.fragmentService.updateEdition
    .mockReturnValueOnce(
      new Promise<Fragment>((resolve) => {
        resolveFirstSave = resolve
      }),
    )
    .mockReturnValueOnce(Promise.resolve(context.updatedFragment))

  submitFormByTestId(screen, 'transliteration-form')
  submitFormByTestId(screen, 'transliteration-form')

  await screen.findAllByText(
    context.updatedFragment.getExternalNumber('cdliNumber'),
  )

  resolveFirstSave(staleFragment)

  await waitFor(() =>
    expect(
      screen.queryByText(staleFragment.getExternalNumber('cdliNumber')),
    ).not.toBeInTheDocument(),
  )
})

it('Ignores a superseded save failure', async () => {
  await setup()
  let rejectFirstSave: (error: Error) => void = () => undefined
  context.fragmentService.updateEdition
    .mockReturnValueOnce(
      new Promise<Fragment>((_resolve, reject) => {
        rejectFirstSave = reject
      }),
    )
    .mockReturnValueOnce(Promise.resolve(context.updatedFragment))

  submitFormByTestId(screen, 'transliteration-form')
  submitFormByTestId(screen, 'transliteration-form')

  await screen.findAllByText(
    context.updatedFragment.getExternalNumber('cdliNumber'),
  )

  rejectFirstSave(new Error('Superseded failure'))

  await waitFor(() =>
    expect(screen.queryByText('Superseded failure')).not.toBeInTheDocument(),
  )
})
